/**
 * Calligraphy brush engine — pressure, wetness, dry-brush, seeded noise.
 * Designed to feel like a reed pen (qalam) on paper.
 * Pen angle, chisel tip, dry split, taper, and hang come from STYLE_PROFILES.
 */
class SeededRandom {
  constructor(seed) {
    this.s = (seed * 9301 + 49297) % 233280;
  }
  next() {
    this.s = (this.s * 9301 + 49297) % 233280;
    return this.s / 233280;
  }
  range(a, b) {
    return a + (b - a) * this.next();
  }
}

const DEFAULT_BRUSH_PHYSICS = {
  penAngleDeg: 35,
  chiselAspect: 0.38,
  drySplit: 0.9,
  taper: 0.12,
  hang: 0,
};

class BrushEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: false });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.params = {
      weight: 0.55,
      wetness: 0.42,
      speed: 0.38,
      formality: 0.72,
      seed: 7,
      ...DEFAULT_BRUSH_PHYSICS,
    };
    this.styleId = "naskh";
    /** "ink" | "erase" — erase removes only what you scrub, keeps the rest */
    this.tool = "ink";
    this.drawing = false;
    this.points = [];
    this.strokes = []; // for undo (ink + erase strokes in order)
    this.currentStroke = null;
    this.lastPos = null;
    this.inkLoad = 1;
  }

  setParams(p) {
    Object.assign(this.params, p);
  }

  /** Switch between pen and eraser. */
  setTool(tool) {
    this.tool = tool === "erase" ? "erase" : "ink";
  }

  getTool() {
    return this.tool;
  }

  /**
   * Apply a STYLE_PROFILES entry: freezes pen physics into params
   * so strokes redraw with the same qalam cut.
   */
  setStyle(profile) {
    if (!profile) return;
    this.styleId = profile.id || this.styleId;
    const b = profile.brush || {};
    this.params.penAngleDeg =
      b.angleDeg != null ? b.angleDeg : profile.penAngleDeg ?? 35;
    this.params.chiselAspect =
      b.chiselAspect != null ? b.chiselAspect : DEFAULT_BRUSH_PHYSICS.chiselAspect;
    this.params.drySplit =
      b.drySplit != null ? b.drySplit : DEFAULT_BRUSH_PHYSICS.drySplit;
    this.params.taper = b.taper != null ? b.taper : DEFAULT_BRUSH_PHYSICS.taper;
    this.params.hang = b.hang != null ? b.hang : 0;
  }

  resize(cssSize) {
    const dpr = this.dpr;
    this.canvas.width = Math.round(cssSize * dpr);
    this.canvas.height = Math.round(cssSize * dpr);
    this.canvas.style.width = `${cssSize}px`;
    this.canvas.style.height = `${cssSize}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.redrawAll();
  }

  clear() {
    this.strokes = [];
    this.currentStroke = null;
    this.points = [];
    this._wipe();
  }

  undo() {
    if (!this.strokes.length) return;
    this.strokes.pop();
    this.redrawAll();
  }

  strokeCount() {
    return this.strokes.length;
  }

  _wipe() {
    const s = this.canvas.width / this.dpr;
    this.ctx.clearRect(0, 0, s, s);
  }

  redrawAll() {
    this._wipe();
    for (const stroke of this.strokes) {
      this._renderStroke(stroke, false);
    }
  }

  beginStroke(x, y, pressure = 0.5) {
    this.drawing = true;
    // Ink load stays high — weight should not fade mid-stroke by default
    this.inkLoad = 1;
    const p = pressure > 0.05 ? pressure : 0.55;
    this.points = [{ x, y, t: performance.now(), p }];
    this.lastPos = { x, y };
    // Eraser slightly larger than the pen so scrubbing is easy
    const eraseBoost = this.tool === "erase" ? 1.55 : 1;
    this.lastWidth = this._stableWidth(p, 0) * eraseBoost;
    this.currentStroke = {
      tool: this.tool,
      points: [],
      params: { ...this.params },
      seed: this.params.seed + this.strokes.length * 17,
    };
    if (this.tool === "erase") {
      this._eraseStamp(x, y, this.lastWidth);
    } else {
      this._stamp(x, y, this.lastWidth * 0.75, p * 0.85);
    }
  }

  /**
   * Width from the weight slider + pressure only.
   * Velocity can thin a little when "speed" is high; wetness no longer
   * drains the stroke to a hairline mid-line (that felt broken).
   */
  _stableWidth(pressure, velocity) {
    const base = this._baseWidth();
    const p = Math.min(1, Math.max(0.15, pressure || 0.55));
    // speed slider: 0 = even width, 1 = thins more when you move fast
    const speedAmt = this.params.speed || 0;
    const thin = 1 / (1 + velocity * speedAmt * 1.8);
    // Pressure only gently modulates — mouse has no real pressure so stays even
    const press = 0.82 + p * 0.28;
    return Math.max(1.5, base * press * (0.88 + thin * 0.12));
  }

  continueStroke(x, y, pressure = 0.5) {
    if (!this.drawing || !this.lastPos) return;

    const now = performance.now();
    const prev = this.points[this.points.length - 1];
    const dx = x - prev.x;
    const dy = y - prev.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.35) return;

    const dt = Math.max(1, now - prev.t);
    const velocity = dist / dt;
    const p = pressure > 0.05 ? pressure : 0.55;

    // Optional dry-brush depletion only when wetness is very low
    if (this.params.wetness < 0.25) {
      this.inkLoad = Math.max(
        0.55,
        this.inkLoad - dist * 0.001 * (1 - this.params.wetness)
      );
    }

    const eraseBoost = this.tool === "erase" ? 1.55 : 1;
    const rawW =
      this._stableWidth(p, velocity) *
      (this.tool === "erase" ? 1 : 0.7 + this.inkLoad * 0.3) *
      eraseBoost;
    // Strong smoothing keeps weight even along the stroke
    const prevW = this.lastWidth != null ? this.lastWidth : rawW;
    const w = prevW * 0.72 + rawW * 0.28;
    this.lastWidth = w;

    this.points.push({ x, y, t: now, p, w, ink: this.inkLoad });
    this.currentStroke.points.push({
      x0: prev.x,
      y0: prev.y,
      x1: x,
      y1: y,
      w,
      ink: this.inkLoad,
      p,
    });

    if (this.tool === "erase") {
      this._eraseSegment(prev.x, prev.y, x, y, w);
    } else {
      this._strokeSegment(prev.x, prev.y, x, y, w, this.inkLoad, p);
    }
    this.lastPos = { x, y };
  }

  endStroke() {
    if (!this.drawing) return;
    this.drawing = false;
    if (this.currentStroke && this.currentStroke.points.length) {
      this.strokes.push(this.currentStroke);
    } else if (this.currentStroke && this.points.length === 1) {
      const p = this.points[0];
      const w =
        this.lastWidth != null
          ? this.lastWidth
          : this._baseWidth() * (this.tool === "erase" ? 1.2 : 0.45);
      this.currentStroke.points.push({
        x0: p.x,
        y0: p.y,
        x1: p.x,
        y1: p.y,
        w,
        ink: this.inkLoad,
        p: 0.5,
      });
      this.strokes.push(this.currentStroke);
    }
    this.currentStroke = null;
    this.points = [];
    this.lastPos = null;
    this.lastWidth = null;
  }

  _baseWidth() {
    // qalam tip: weight maps to ~4–48 px
    return 4 + this.params.weight * 44;
  }

  /** Chisel orientation in radians from style pen angle + hang steepness. */
  _penAngleRad() {
    const deg = this.params.penAngleDeg ?? 35;
    const hang = this.params.hang || 0;
    // hang steepens the cut (Nastaʿliq / Diwani cascade feel)
    const effective = deg + hang * 18;
    // Negative so the thick edge follows classical right-to-left qalam cut
    return -(effective * Math.PI) / 180;
  }

  _strokeSegment(x0, y0, x1, y1, width, ink, pressure) {
    const ctx = this.ctx;
    const dist = Math.hypot(x1 - x0, y1 - y0);
    // Overlap stamps tightly so the stroke reads as one continuous ribbon
    const steps = Math.max(1, Math.ceil(dist / 0.9));
    const wet = this.params.wetness;
    const formal = this.params.formality;
    const rng = new SeededRandom(
      (this.params.seed + Math.floor(x0 * 3) + Math.floor(y0 * 7)) | 0
    );

    const penAngle = this._penAngleRad();
    const dry = 1 - wet;
    const aspect =
      this.params.chiselAspect != null
        ? this.params.chiselAspect
        : DEFAULT_BRUSH_PHYSICS.chiselAspect;
    const drySplit =
      this.params.drySplit != null
        ? this.params.drySplit
        : DEFAULT_BRUSH_PHYSICS.drySplit;
    const taperAmt =
      this.params.taper != null ? this.params.taper : DEFAULT_BRUSH_PHYSICS.taper;
    const hang = this.params.hang || 0;

    // Qalam tip: long thin chisel (wet) vs flatter for geometric styles
    const rxScale = 0.1 + aspect * 0.22;
    const ryScale = 0.52 - aspect * 0.18;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let x = x0 + (x1 - x0) * t;
      let y = y0 + (y1 - y0) * t;

      if (hang > 0.05) {
        const dx = x1 - x0;
        if (dx < 0) y += Math.abs(dx) * t * hang * 0.06;
      }

      const taper = 1 - taperAmt * 0.35 + taperAmt * 0.35 * Math.sin(t * Math.PI);
      // Less noise when formal — cleaner book-hand look
      const jitter = (1 - formal) * rng.range(-0.04, 0.04);
      const w = Math.max(1.2, width * taper * (1 + jitter));
      const alpha = Math.min(0.94, 0.38 + ink * 0.45 + pressure * 0.14);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(penAngle);

      if (dry > 0.45 && ink < 0.62) {
        const bristles = 2 + Math.floor(dry * 3 * Math.min(1.3, drySplit));
        for (let b = 0; b < bristles; b++) {
          const ox = (b - (bristles - 1) / 2) * (w * 0.14 * drySplit);
          const oy = rng.range(-w * 0.05, w * 0.05) * drySplit;
          const bw = Math.max(0.35, w * rng.range(0.07, 0.16) * (0.75 + aspect));
          const bh = Math.max(0.5, w * rng.range(0.22, 0.45));
          const a = alpha * rng.range(0.35, 0.7) * ink;
          ctx.fillStyle = `rgba(18, 14, 10, ${a})`;
          ctx.beginPath();
          ctx.ellipse(ox, oy, bw, bh, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const a = alpha * (0.85 + wet * 0.15);
        ctx.fillStyle = `rgba(14, 11, 8, ${a})`;
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          Math.max(0.45, w * rxScale),
          Math.max(0.7, w * ryScale),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Soft edge so stamps blend into one stroke
        ctx.fillStyle = `rgba(14, 11, 8, ${a * 0.22})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * rxScale * 1.35, w * ryScale * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  _stamp(x, y, w, pressure) {
    const ctx = this.ctx;
    const a = 0.22 + pressure * 0.28;
    const aspect =
      this.params.chiselAspect != null
        ? this.params.chiselAspect
        : DEFAULT_BRUSH_PHYSICS.chiselAspect;
    const rxScale = 0.1 + aspect * 0.22;
    const ryScale = 0.52 - aspect * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this._penAngleRad());
    ctx.fillStyle = `rgba(14, 11, 8, ${a})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(0.4, w * rxScale), Math.max(0.5, w * ryScale), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Soft round erase — removes ink under the finger only */
  _eraseStamp(x, y, w) {
    const ctx = this.ctx;
    const r = Math.max(4, w * 0.55);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // Soft edge
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _eraseSegment(x0, y0, x1, y1, width) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist / 1.2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this._eraseStamp(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, width);
    }
  }

  _renderStroke(stroke, live) {
    // Re-render from stored segments with stroke's frozen params
    const saved = { ...this.params };
    this.params = { ...DEFAULT_BRUSH_PHYSICS, ...stroke.params };
    const isErase = stroke.tool === "erase";
    for (const seg of stroke.points) {
      if (isErase) {
        this._eraseSegment(seg.x0, seg.y0, seg.x1, seg.y1, seg.w);
      } else {
        this._strokeSegment(
          seg.x0,
          seg.y0,
          seg.x1,
          seg.y1,
          seg.w,
          seg.ink,
          seg.p
        );
      }
    }
    this.params = saved;
  }

  _densify(points, cssSize) {
    const abs = points.map((p) =>
      p.x <= 1 && p.y <= 1 ? { x: p.x * cssSize, y: p.y * cssSize } : p
    );
    const dense = [];
    for (let i = 0; i < abs.length - 1; i++) {
      const a = abs[i];
      const b = abs[i + 1];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const n = Math.max(2, Math.ceil(d / 1.8));
      for (let j = 0; j < n; j++) {
        const t = j / n;
        // ease for smoother curves
        const s = t * t * (3 - 2 * t);
        dense.push({
          x: a.x + (b.x - a.x) * s,
          y: a.y + (b.y - a.y) * s,
        });
      }
    }
    dense.push(abs[abs.length - 1]);
    return dense;
  }

  /**
   * Animate one continuous stroke along points.
   * durationMs = how long the pen takes to finish this stroke.
   */
  async animatePath(points, cssSize, durationMs = 1400) {
    if (!points || points.length < 2) return;
    const dense = this._densify(points, cssSize);
    if (dense.length < 2) return;

    const start = dense[0];
    // Even pressure — animated paths should look like a steady hand
    this.beginStroke(start.x, start.y, 0.6);
    const t0 = performance.now();
    let drawn = 0;

    return new Promise((resolve) => {
      const step = (now) => {
        const u = Math.min(1, (now - t0) / Math.max(80, durationMs));
        const target = Math.min(
          dense.length - 1,
          Math.floor(u * (dense.length - 1))
        );
        while (drawn < target) {
          drawn++;
          const p = dense[drawn];
          this.continueStroke(p.x, p.y, 0.6);
        }
        if (u < 1) requestAnimationFrame(step);
        else {
          this.endStroke();
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  /**
   * Animate several strokes in sequence (lift pen between them).
   * strokes = array of point-arrays. playSpeed: 0.25 (slow) … 2 (fast).
   */
  async animateStrokes(strokes, cssSize, playSpeed = 1) {
    if (!strokes || !strokes.length) return;
    const speed = Math.max(0.2, Math.min(2.5, playSpeed));
    for (let i = 0; i < strokes.length; i++) {
      const pts = strokes[i];
      if (!pts || pts.length < 2) continue;
      let len = 0;
      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1];
        const b = pts[j];
        const ax = a.x <= 1 ? a.x * cssSize : a.x;
        const ay = a.y <= 1 ? a.y * cssSize : a.y;
        const bx = b.x <= 1 ? b.x * cssSize : b.x;
        const by = b.y <= 1 ? b.y * cssSize : b.y;
        len += Math.hypot(bx - ax, by - ay);
      }
      // Cap duration so long glyph fills stay snappy
      const duration = Math.min(2800, Math.max(220, (len * 2.4) / speed));
      await this.animatePath(pts, cssSize, duration);
      if (i < strokes.length - 1) {
        await new Promise((r) => setTimeout(r, Math.max(40, 120 / speed)));
      }
    }
  }
}

/**
 * Paper surface renderer (plain / grid / scroll texture).
 * Grid modes: baseline (Arabic mashq), square (Kufic modules), hanging (Nastaʿliq).
 */
class PaperSurface {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.mode = "plain";
    this.gridKind = "baseline";
    this.penAngleDeg = 35;
    this.showMeasures = true;
  }

  resize(cssSize) {
    const dpr = this.dpr;
    this.canvas.width = Math.round(cssSize * dpr);
    this.canvas.height = Math.round(cssSize * dpr);
    this.canvas.style.width = `${cssSize}px`;
    this.canvas.style.height = `${cssSize}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw(cssSize);
  }

  setMode(mode) {
    this.mode = mode;
  }

  setGridKind(kind) {
    this.gridKind = kind || "baseline";
  }

  setPenAngle(deg) {
    this.penAngleDeg = deg != null ? deg : 35;
  }

  setShowMeasures(on) {
    this.showMeasures = !!on;
  }

  draw(size) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, size, size);

    // base paper (stable — no random fiber reseed every redraw)
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, "#f8f3e9");
    g.addColorStop(0.5, "#f5f0e4");
    g.addColorStop(1, "#f2ebd9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // subtle fiber (seeded so grid redraws don’t flicker)
    let seed = 42;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    ctx.globalAlpha = 0.035;
    for (let i = 0; i < 700; i++) {
      const x = rnd() * size;
      const y = rnd() * size;
      const w = 0.5 + rnd() * 2.2;
      const h = 0.4 + rnd() * 1.2;
      ctx.fillStyle = rnd() > 0.5 ? "#3a2a18" : "#c4b69a";
      ctx.fillRect(x, y, w, h);
    }
    ctx.globalAlpha = 1;

    if (this.mode === "grid") {
      if (this.gridKind === "square") {
        this._drawSquareGrid(size);
      } else if (this.gridKind === "hanging") {
        this._drawHangingGrid(size);
      } else {
        this._drawBaselineGrid(size);
      }
    } else if (this.mode === "scroll") {
      this._drawScroll(size);
    }
  }

  /**
   * Arabic mashq ruling: baseline + nuqṭa alif measure + pen angle.
   */
  _drawBaselineGrid(size) {
    const ctx = this.ctx;
    const m = size * 0.1;
    const boxW = size - m * 2;
    const boxH = size - m * 2;

    const baseline = m + boxH * 0.62;
    // Nuqṭa unit: alif ≈ 6 dots (naskh-like)
    const nuqta = boxH * 0.055;
    const alifDots = 6;
    const alifTop = baseline - nuqta * alifDots;
    const midLine = baseline - nuqta * 3;
    const descender = baseline + nuqta * 2.5;
    const bowlLow = baseline + nuqta * 4;

    // Side rails
    ctx.strokeStyle = "rgba(139, 58, 42, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m, m + boxH * 0.12);
    ctx.lineTo(m, m + boxH * 0.88);
    ctx.moveTo(m + boxW, m + boxH * 0.12);
    ctx.lineTo(m + boxW, m + boxH * 0.88);
    ctx.stroke();

    // Strong baseline
    ctx.strokeStyle = "rgba(139, 58, 42, 0.42)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(m, baseline);
    ctx.lineTo(m + boxW, baseline);
    ctx.stroke();

    // Soft guides
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    const softLines = [
      { y: alifTop, a: 0.24 },
      { y: midLine, a: 0.16 },
      { y: descender, a: 0.18 },
      { y: bowlLow, a: 0.12 },
    ];
    for (const { y, a } of softLines) {
      ctx.strokeStyle = `rgba(139, 58, 42, ${a})`;
      ctx.beginPath();
      ctx.moveTo(m, y);
      ctx.lineTo(m + boxW, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  /**
   * Square modular grid for Kufic / geometric practice.
   */
  _drawSquareGrid(size) {
    const ctx = this.ctx;
    const m = size * 0.1;
    const box = size - m * 2;
    const cells = 8;
    const step = box / cells;

    // Outer frame
    ctx.strokeStyle = "rgba(139, 58, 42, 0.28)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(m, m, box, box);

    // Module grid
    ctx.strokeStyle = "rgba(139, 58, 42, 0.12)";
    ctx.lineWidth = 1;
    for (let i = 1; i < cells; i++) {
      const x = m + i * step;
      const y = m + i * step;
      ctx.beginPath();
      ctx.moveTo(x, m);
      ctx.lineTo(x, m + box);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(m, y);
      ctx.lineTo(m + box, y);
      ctx.stroke();
    }

    // Mid axes slightly stronger (symmetry for square Kufic)
    ctx.strokeStyle = "rgba(139, 58, 42, 0.2)";
    ctx.beginPath();
    ctx.moveTo(m + box / 2, m);
    ctx.lineTo(m + box / 2, m + box);
    ctx.moveTo(m, m + box / 2);
    ctx.lineTo(m + box, m + box / 2);
    ctx.stroke();

    // Corner brackets (architectural feel)
    ctx.strokeStyle = "rgba(139, 58, 42, 0.25)";
    const c = 12;
    ctx.beginPath();
    ctx.moveTo(m + c, m);
    ctx.lineTo(m, m);
    ctx.lineTo(m, m + c);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(m + box - c, m);
    ctx.lineTo(m + box, m);
    ctx.lineTo(m + box, m + c);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(m, m + box - c);
    ctx.lineTo(m, m + box);
    ctx.lineTo(m + c, m + box);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(m + box, m + box - c);
    ctx.lineTo(m + box, m + box);
    ctx.lineTo(m + box - c, m + box);
    ctx.stroke();
  }

  /**
   * Diagonal hanging baseline hint for Nastaʿliq cascade practice.
   */
  _drawHangingGrid(size) {
    const ctx = this.ctx;
    const m = size * 0.1;
    const boxW = size - m * 2;
    const boxH = size - m * 2;

    // Main hanging line: high-right → low-left
    const x0 = m + boxW * 0.92;
    const y0 = m + boxH * 0.32;
    const x1 = m + boxW * 0.08;
    const y1 = m + boxH * 0.72;

    // Parallel cascade guides (word-step bands)
    const offsets = [-0.12, -0.06, 0, 0.06, 0.12, 0.18];
    for (let i = 0; i < offsets.length; i++) {
      const o = offsets[i] * boxH;
      const strong = i === 2;
      ctx.strokeStyle = strong
        ? "rgba(139, 58, 42, 0.38)"
        : "rgba(139, 58, 42, 0.12)";
      ctx.lineWidth = strong ? 1.4 : 1;
      if (!strong) ctx.setLineDash([4, 6]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x0, y0 + o);
      ctx.lineTo(x1, y1 + o);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Soft vertical bounds
    ctx.strokeStyle = "rgba(139, 58, 42, 0.1)";
    ctx.beginPath();
    ctx.moveTo(m, m + boxH * 0.15);
    ctx.lineTo(m, m + boxH * 0.9);
    ctx.moveTo(m + boxW, m + boxH * 0.15);
    ctx.lineTo(m + boxW, m + boxH * 0.9);
    ctx.stroke();
  }

  /** Classical nuqṭa = diamond from the pen tip */
  _drawNuqta(x, y, r, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = `rgba(139, 58, 42, ${alpha})`;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  _label(x, y, text, alpha) {
    const ctx = this.ctx;
    ctx.save();
    const paper = ctx.canvas.width / this.dpr;
    const fs = Math.max(9, Math.min(11, paper * 0.026));
    ctx.font = `${fs}px "IBM Plex Sans Arabic", system-ui, sans-serif`;
    ctx.fillStyle = `rgba(139, 58, 42, ${alpha})`;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _drawPenAngleHint(x, y, deg, alpha) {
    const ctx = this.ctx;
    const rad = (-deg * Math.PI) / 180;
    const len = 26;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rad);
    ctx.strokeStyle = `rgba(139, 58, 42, ${alpha})`;
    ctx.fillStyle = `rgba(139, 58, 42, ${alpha})`;
    ctx.lineWidth = 1.4;
    // wide chisel edge
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();
    ctx.lineWidth = 1;
    // nib diamond
    ctx.beginPath();
    ctx.moveTo(len / 2 + 1, 0);
    ctx.lineTo(len / 2 - 5, -4);
    ctx.lineTo(len / 2 - 5, 4);
    ctx.closePath();
    ctx.fill();
    // thin guide line showing stroke direction
    ctx.globalAlpha = alpha * 0.7;
    ctx.beginPath();
    ctx.moveTo(-len / 2, -5);
    ctx.lineTo(len / 2, 5);
    ctx.stroke();
    ctx.restore();
  }

  _drawScroll(size) {
    const ctx = this.ctx;
    // aged parchment edges
    const edge = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.25,
      size / 2,
      size / 2,
      size * 0.72
    );
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(0.7, "rgba(90, 55, 25, 0.03)");
    edge.addColorStop(1, "rgba(70, 40, 15, 0.12)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, size, size);

    // horizontal scroll ruling
    ctx.strokeStyle = "rgba(90, 55, 25, 0.08)";
    ctx.lineWidth = 1;
    const step = size / 14;
    for (let y = step * 2; y < size - step; y += step) {
      ctx.beginPath();
      ctx.moveTo(size * 0.08, y);
      ctx.lineTo(size * 0.92, y);
      ctx.stroke();
    }

    // soft fold
    ctx.strokeStyle = "rgba(90, 55, 25, 0.06)";
    ctx.beginPath();
    ctx.moveTo(size * 0.15, 0);
    ctx.quadraticCurveTo(size * 0.45, size * 0.5, size * 0.12, size);
    ctx.stroke();
  }
}
