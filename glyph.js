/**
 * Glyph layer — ghost outline + Show me animation.
 *
 * Ghost and Show me share one rendered letter bitmap.
 * Show me reveals that letter column-by-column (Arabic: right → left)
 * so the shape appears solid as the pen passes.
 *
 * Long words / multi-word phrases auto-fit to the paper width.
 * Optional userScale (text size) multiplies the base size.
 */

const PAPER_BASELINE = 0.62;
/** Keep ink inside the paper with a little margin */
const PAPER_TEXT_MAX_WIDTH = 0.86;
const MIN_FONT_RATIO = 0.12;
const MAX_FONT_RATIO = 0.62;

function getLetterLayout(text, paperSize, guide = {}) {
  const t = (text || "").trim().replace(/\s+/g, " ");
  if (!t) {
    return {
      text: "",
      lines: [],
      fontPx: 0,
      baselineY: paperSize * PAPER_BASELINE,
      centerX: paperSize / 2,
      lineHeight: 0,
      fontFamily: guide.fontFamily || '"Noto Naskh Arabic", "Amiri", serif',
      fontWeight: guide.fontWeight || "500",
      fontStyle: guide.fontStyle || "normal",
      letterSpacing: guide.letterSpacing || "0",
    };
  }

  const styleScale = guide.scale != null ? guide.scale : 0.55;
  // User text-size control (0.45–1.6 typical); 1 = default
  const userScale =
    guide.userScale != null
      ? Math.max(0.4, Math.min(1.8, guide.userScale))
      : 1;

  // Rough length from letters only (ignore tatweel / spaces for base guess)
  const TATWEEL = "\u0640";
  const lettersOnly = [...t].filter((ch) => ch !== TATWEEL && ch !== " ");
  const letterCount = Math.max(1, lettersOnly.length);
  const wordCount = t.split(" ").filter(Boolean).length;

  // Longer text → start smaller so fit is closer
  let lenFactor = 1;
  if (letterCount >= 12) lenFactor = 0.42;
  else if (letterCount >= 8) lenFactor = 0.5;
  else if (letterCount >= 5) lenFactor = 0.58;
  else if (letterCount >= 4) lenFactor = 0.66;
  else if (letterCount === 3) lenFactor = 0.78;
  else if (letterCount === 2) lenFactor = 0.9;

  if (wordCount >= 3) lenFactor *= 0.9;
  else if (wordCount === 2) lenFactor *= 0.95;

  let fontPx = paperSize * styleScale * lenFactor * userScale;
  const minPx = paperSize * MIN_FONT_RATIO * Math.min(1, userScale);
  const maxPx = paperSize * MAX_FONT_RATIO * userScale;
  fontPx = Math.max(minPx, Math.min(maxPx, fontPx));

  const fontFamily =
    guide.fontFamily || '"Noto Naskh Arabic", "Amiri", serif';
  const fontWeight = guide.fontWeight || "500";
  const fontStyle = guide.fontStyle || "normal";
  const letterSpacing = guide.letterSpacing || "0";

  const probe = document.createElement("canvas").getContext("2d");
  const applyFont = (px) => {
    probe.font = `${fontStyle} ${fontWeight} ${px}px ${fontFamily}`;
    try {
      if (letterSpacing && letterSpacing !== "0") {
        probe.letterSpacing = letterSpacing;
      }
    } catch (_) {
      /* ignore */
    }
  };

  const maxW = paperSize * PAPER_TEXT_MAX_WIDTH;
  applyFont(fontPx);
  let width = probe.measureText(t).width;

  // Shrink to fit one line when possible
  if (width > maxW && width > 0) {
    fontPx = Math.max(minPx, fontPx * (maxW / width));
    applyFont(fontPx);
    width = probe.measureText(t).width;
  }

  // Multi-word: if still too wide at minimum, wrap onto 2+ lines
  let lines = [t];
  if (width > maxW * 1.02 && wordCount >= 2) {
    lines = wrapArabicWords(t, probe, maxW, fontStyle, fontWeight, fontFamily, letterSpacing, minPx, fontPx);
    // After wrap, size may still need a slight shrink for the longest line
    applyFont(fontPx);
    let longest = 0;
    for (const line of lines) {
      longest = Math.max(longest, probe.measureText(line).width);
    }
    if (longest > maxW && longest > 0) {
      fontPx = Math.max(minPx * 0.85, fontPx * (maxW / longest));
    }
  }

  const lineHeight = fontPx * 1.35;
  // Stack multi-line blocks so the last line sits on the paper baseline
  const baselineY = paperSize * PAPER_BASELINE;
  const firstLineY = baselineY - (lines.length - 1) * lineHeight;

  return {
    text: t,
    lines,
    fontPx,
    baselineY,
    firstLineY,
    lineHeight,
    centerX: paperSize / 2,
    fontFamily,
    fontWeight,
    fontStyle,
    letterSpacing,
    rotateDeg: 0,
  };
}

/**
 * Greedy wrap by spaces (RTL text still wraps right-to-left visually via canvas direction).
 */
function wrapArabicWords(text, probe, maxW, fontStyle, fontWeight, fontFamily, letterSpacing, minPx, fontPx) {
  const words = text.split(" ").filter(Boolean);
  if (words.length < 2) return [text];

  probe.font = `${fontStyle} ${fontWeight} ${fontPx}px ${fontFamily}`;
  try {
    if (letterSpacing && letterSpacing !== "0") probe.letterSpacing = letterSpacing;
  } catch (_) {
    /* ignore */
  }

  const lines = [];
  let current = "";
  for (const word of words) {
    const trial = current ? current + " " + word : word;
    if (probe.measureText(trial).width <= maxW || !current) {
      current = trial;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  // Prefer at most 3 lines for practice paper readability
  if (lines.length > 3) {
    // Join overflow into last lines by re-flowing with slightly smaller effective width handling
    const flat = words.join(" ");
    const third = Math.ceil(words.length / 3);
    return [
      words.slice(0, third).join(" "),
      words.slice(third, third * 2).join(" "),
      words.slice(third * 2).join(" "),
    ].filter(Boolean);
  }
  return lines;
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

  const lines =
    layout.lines && layout.lines.length ? layout.lines : [layout.text];
  const lineHeight = layout.lineHeight || layout.fontPx * 1.35;
  let y =
    layout.firstLineY != null
      ? layout.firstLineY
      : layout.baselineY - (lines.length - 1) * lineHeight;

  for (const line of lines) {
    ctx.fillText(line, layout.centerX, y);
    y += lineHeight;
  }
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
  const userScale = guide.userScale != null ? guide.userScale : 1;
  const key = `${text}|${size}|${styleId}|${guide.scale}|${userScale}|${guide.fontFamily}|${guide.fontWeight}|${guide.fontStyle}|${guide.letterSpacing}`;
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
    data[(y * width + x) * 4 + 3] > 18;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  const columns = new Array(width).fill(null);

  for (let x = 0; x < width; x++) {
    let y0 = -1;
    let y1 = -1;
    for (let y = 0; y < height; y++) {
      if (inkAt(x, y)) {
        if (y0 < 0) y0 = y;
        y1 = y;
      }
    }
    if (y0 >= 0) {
      columns[x] = { y0, y1 };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y0 < minY) minY = y0;
      if (y1 > maxY) maxY = y1;
    }
  }

  if (maxX < minX) {
    return {
      minX: 0,
      maxX: width - 1,
      minY: 0,
      maxY: height - 1,
      columns,
    };
  }
  return { minX, maxX, minY, maxY, columns };
}

/**
 * Animate Show me: reveal glyph from right → left with a soft pen tip.
 */
async function animateShowMeGlyph(
  inkCanvas,
  text,
  paperSize,
  playSpeed,
  guide,
  styleId
) {
  const size = Math.round(paperSize);
  const shared = getSharedGlyphLayer(text, size, guide, styleId);
  if (!shared?.layer) return;

  const { layer } = shared;
  const analysis = analyzeGlyph(layer, size);
  const { minX, maxX, columns } = analysis;
  const span = Math.max(1, maxX - minX);

  const ctx = inkCanvas.getContext("2d");
  const dpr = inkCanvas.width / size;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const mask = document.createElement("canvas");
  mask.width = size;
  mask.height = size;
  const mctx = mask.getContext("2d");
  const frame = document.createElement("canvas");
  frame.width = size;
  frame.height = size;
  const fctx = frame.getContext("2d");

  const speed = Math.max(0.25, Math.min(2.5, playSpeed || 1));
  // Longer phrases need a bit more time
  const charCount = Math.max(1, [...text.trim().replace(/\s/g, "")].length);
  const duration = Math.max(900, (1700 + charCount * 320) / speed);

  const softEdge = Math.max(10, Math.round(size * 0.035));
  const tipR = Math.max(3, size * 0.012);

  // Pre-clear ink canvas once
  ctx.clearRect(0, 0, size, size);

  const t0 = performance.now();
  let lastFrontierX = maxX + softEdge;

  return new Promise((resolve) => {
    const step = (now) => {
      const u = Math.min(1, (now - t0) / duration);
      // ease in-out
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      // Arabic: start at right (maxX), move left
      const frontierX = Math.floor(maxX - e * (span + softEdge));

      mctx.clearRect(0, 0, size, size);
      // Reveal everything to the right of frontier (already “written”)
      if (lastFrontierX > frontierX) {
        const from = Math.max(minX, frontierX);
        const to = Math.min(maxX, lastFrontierX - 1);
        for (let x = from; x <= to; x++) {
          const col = columns[x];
          if (!col) continue;
          const top = Math.max(0, col.y0 - 2);
          const bot = Math.min(size, col.y1 + 2);
          mctx.fillStyle = "#000";
          mctx.fillRect(x, top, 1, bot - top);
        }
      }
      lastFrontierX = frontierX;

      fctx.clearRect(0, 0, size, size);
      fctx.drawImage(layer, 0, 0);
      fctx.globalCompositeOperation = "destination-in";
      fctx.drawImage(mask, 0, 0);
      fctx.globalCompositeOperation = "source-over";

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(frame, 0, 0);

      // Soft pen blob at the writing tip for “hand” feel
      const tipX = Math.max(minX, Math.min(maxX, frontierX + softEdge * 0.35));
      const tipCol = columns[Math.round(tipX)] || columns[maxX] || null;
      const tipY = tipCol
        ? (tipCol.y0 + tipCol.y1) / 2
        : size * PAPER_BASELINE - size * 0.08;
      ctx.fillStyle = "rgba(20, 16, 12, 0.55)";
      ctx.beginPath();
      ctx.arc(tipX, tipY, tipR, 0, Math.PI * 2);
      ctx.fill();

      if (u < 1) requestAnimationFrame(step);
      else {
        // Final solid glyph
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(layer, 0, 0);
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}
