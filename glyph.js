/**
 * Glyph layer — ghost outline + Show me animation.
 *
 * Ghost and Show me share one rendered letter bitmap.
 * Show me reveals that letter column-by-column (Arabic: right → left)
 * so the shape appears solid as the pen passes.
 */

const PAPER_BASELINE = 0.62;

function getLetterLayout(text, paperSize, guide = {}) {
  const t = (text || "").trim();
  // Count real letters only — ignore tatweel so form strings (ـبـ) stay large
  const TATWEEL = "\u0640";
  const lettersOnly = [...t].filter((ch) => ch !== TATWEEL);
  const len = Math.max(1, lettersOnly.length);
  const styleScale = guide.scale != null ? guide.scale : 0.55;
  const lenFactor =
    len >= 4 ? 0.62 : len === 3 ? 0.76 : len === 2 ? 0.88 : 1;
  const fontPx = paperSize * styleScale * lenFactor;
  return {
    text: t,
    fontPx,
    baselineY: paperSize * PAPER_BASELINE,
    centerX: paperSize / 2,
    fontFamily:
      guide.fontFamily || '"Noto Naskh Arabic", "Amiri", serif',
    fontWeight: guide.fontWeight || "500",
    fontStyle: guide.fontStyle || "normal",
    letterSpacing: guide.letterSpacing || "0",
    rotateDeg: 0,
  };
}

function fontString(layout) {
  const family =
    layout.fontFamily || '"Noto Naskh Arabic", "Amiri", serif';
  return `${layout.fontStyle} ${layout.fontWeight} ${layout.fontPx}px ${family}`;
}

function drawLetterOnContext(ctx, layout) {
  if (!layout.text) return;
  ctx.save();
  ctx.fillStyle = "#14110e";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = fontString(layout);
  ctx.direction = "rtl";
  if (layout.letterSpacing && layout.letterSpacing !== "0") {
    try {
      ctx.letterSpacing = layout.letterSpacing;
    } catch (_) {
      /* ignore */
    }
  }
  ctx.fillText(layout.text, layout.centerX, layout.baselineY);
  ctx.restore();
}

function renderGlyphLayer(text, paperSize, guide = {}) {
  const size = Math.round(paperSize);
  const layout = getLetterLayout(text, size, guide);
  if (!layout.text) return null;
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const ctx = off.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  drawLetterOnContext(ctx, layout);
  return { layer: off, layout, size };
}

let _glyphCache = null;

function getSharedGlyphLayer(text, paperSize, guide = {}, styleId = "") {
  const size = Math.round(paperSize);
  const key = `${text}|${size}|${styleId}|${guide.scale}|${guide.fontFamily}|${guide.fontWeight}|${guide.fontStyle}|${guide.letterSpacing}`;
  if (_glyphCache && _glyphCache.key === key) return _glyphCache;
  const rendered = renderGlyphLayer(text, size, guide);
  if (!rendered) {
    _glyphCache = null;
    return null;
  }
  _glyphCache = { key, ...rendered };
  return _glyphCache;
}

function clearGlyphCache() {
  _glyphCache = null;
}

function getPaperBaseline() {
  return PAPER_BASELINE;
}

/**
 * Analyze glyph: bounds + per-column ink range (for full vertical coverage).
 * Writing direction for Arabic: right edge → left edge.
 */
function analyzeGlyph(layer, paperSize) {
  const c = layer.getContext("2d", { willReadFrequently: true });
  const { data, width, height } = c.getImageData(0, 0, paperSize, paperSize);
  const inkAt = (x, y) =>
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height &&
    data[(y * width + x) * 4 + 3] > 32;

  let minX = width,
    maxX = -1,
    minY = height,
    maxY = -1;

  // columns[x] = { y0, y1, tipY } or null
  const columns = new Array(width).fill(null);

  for (let x = 0; x < width; x++) {
    let y0 = -1,
      y1 = -1,
      sum = 0,
      n = 0;
    for (let y = 0; y < height; y++) {
      if (inkAt(x, y)) {
        if (y0 < 0) y0 = y;
        y1 = y;
        sum += y;
        n++;
      }
    }
    if (n > 0) {
      columns[x] = {
        y0,
        y1,
        // pen tip rides the upper part of the ink (natural writing line)
        tipY: y0 * 0.35 + (sum / n) * 0.65,
      };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y0 < minY) minY = y0;
      if (y1 > maxY) maxY = y1;
    }
  }

  if (maxX < 0) {
    return {
      minX: Math.floor(width * 0.25),
      maxX: Math.floor(width * 0.75),
      minY: Math.floor(height * 0.3),
      maxY: Math.floor(height * 0.7),
      columns,
      empty: true,
    };
  }

  return { minX, maxX, minY, maxY, columns, empty: false };
}

/**
 * Show me — solid quality:
 *
 * 1. Start at the RIGHT of the word (Arabic writing direction).
 * 2. Move left. For every column the pen has passed, reveal the FULL
 *    letter ink in that column (top to bottom) — so no holes, no
 *    “pop in at the end.”
 * 3. Soft leading edge + visible pen tip for a writing feel.
 * 4. End frame is the same letter already fully revealed (no snap).
 */
async function animateShowMeGlyph(
  inkCanvas,
  text,
  paperSize,
  playSpeed,
  guide = {},
  styleId = ""
) {
  const size = Math.round(paperSize);
  const shared = getSharedGlyphLayer(text, size, guide, styleId);
  if (!shared?.layer) return 0;

  const { layer } = shared;
  const analysis = analyzeGlyph(layer, size);
  const { minX, maxX, columns } = analysis;
  const span = Math.max(1, maxX - minX);

  const ctx = inkCanvas.getContext("2d");
  const dpr = inkCanvas.width / size;

  // Working buffers (reused every frame)
  const mask = document.createElement("canvas");
  mask.width = size;
  mask.height = size;
  const mctx = mask.getContext("2d");

  const frame = document.createElement("canvas");
  frame.width = size;
  frame.height = size;
  const fctx = frame.getContext("2d");

  const speed = Math.max(0.25, Math.min(2.5, playSpeed || 1));
  const charCount = Math.max(1, [...text.trim()].length);
  // Slightly longer for multi-letter words so each part is readable
  const duration = Math.max(800, (1700 + charCount * 380) / speed);

  // Soft edge width in pixels (leading soft “brush” band)
  const softEdge = Math.max(10, Math.round(size * 0.035));
  const tipR = Math.max(3, size * 0.012);

  // Pre-clear ink canvas once
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const t0 = performance.now();
  // Track last drawn frontier so we only ADD to the mask (never rebuild)
  let lastFrontierX = maxX + 1;

  return new Promise((resolve) => {
    const step = (now) => {
      const u = Math.min(1, (now - t0) / duration);
      // ease-in-out for a steady hand
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;

      // Frontier moves right → left: at e=0 we're at maxX, at e=1 at minX-1
      const frontierX = Math.floor(maxX - e * (span + softEdge));

      // Add newly covered columns to the mask (full height of ink + padding)
      // Only paint columns we haven't painted yet (leftward progress)
      if (frontierX < lastFrontierX) {
        mctx.fillStyle = "#000";
        const from = Math.max(minX, frontierX);
        const to = Math.min(maxX, lastFrontierX - 1);
        for (let x = from; x <= to; x++) {
          const col = columns[x];
          if (!col) continue;
          // Full vertical coverage of this column of the letter
          const top = Math.max(0, col.y0 - 2);
          const bot = Math.min(size, col.y1 + 2);
          mctx.fillRect(x, top, 1, bot - top + 1);
        }
        // Soft leading band (slightly left of frontier) for smoother edge
        // already included as frontier advances; add feathered tips near edge
        lastFrontierX = frontierX;
      }

      // Soft pen blob at the writing tip for “hand” feel
      const tipX = Math.max(minX, Math.min(maxX, frontierX + softEdge * 0.35));
      const tipCol = columns[Math.round(tipX)] || columns[maxX] || null;
      const tipY = tipCol
        ? tipCol.tipY
        : size * PAPER_BASELINE - size * 0.08;

      // Soft soft-edge: stamp a larger soft circle at tip into mask
      // (covers any thin gaps near the leading edge without holes)
      if (u < 1) {
        mctx.beginPath();
        mctx.arc(tipX, tipY, softEdge * 0.85, 0, Math.PI * 2);
        mctx.fill();
      }

      // Compose: clean letter only where mask is solid
      fctx.globalCompositeOperation = "source-over";
      fctx.clearRect(0, 0, size, size);
      fctx.drawImage(layer, 0, 0);
      fctx.globalCompositeOperation = "destination-in";
      fctx.drawImage(mask, 0, 0);
      fctx.globalCompositeOperation = "source-over";

      // Present
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(frame, 0, 0);

      // Pen tip (small, on top)
      if (u < 0.985) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(16, 12, 9, 0.92)";
        ctx.arc(tipX, tipY, tipR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.arc(tipX - tipR * 0.3, tipY - tipR * 0.3, tipR * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      if (u < 1) {
        requestAnimationFrame(step);
      } else {
        // Same letter already fully revealed — paint once more without tip
        // (no visual “snap”; mask should already cover everything)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(layer, 0, 0);
        resolve(1);
      }
    };
    requestAnimationFrame(step);
  });
}
