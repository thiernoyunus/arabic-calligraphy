/**
 * Calligraphy style profiles for حبر · Ink.
 *
 * Each style uses a real Arabic web font close to that family, plus pen-feel
 * defaults (angle / tip). Writing mode always uses Naskh (clear school hand).
 * Screen models are practice aids — not a substitute for a reed pen and teacher.
 */
const STYLE_PROFILES = {
  naskh: {
    id: "naskh",
    arabicName: "النسخ",
    englishName: "Naskh",
    family: "six-pens",
    description:
      "Clear book hand used for Qur’an print and school texts. The best style for learning the alphabet.",
    penAngleDeg: 35,
    defaults: { weight: 0.5 },
    brush: {
      angleDeg: 35,
      chiselAspect: 0.4,
      drySplit: 0.95,
      taper: 0.1,
      hang: 0,
    },
    guide: {
      // True naskh text face — simple shapes, easy to copy
      fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
      fontStyle: "normal",
      fontWeight: "500",
      letterSpacing: "0",
      opacity: 0.16,
      scale: 0.58,
    },
    gridKind: "baseline",
  },

  ruqah: {
    id: "ruqah",
    arabicName: "الرقعة",
    englishName: "Ruqʿah",
    family: "six-pens",
    description:
      "Everyday handwriting script — short, compact strokes. Common for notes and signs.",
    penAngleDeg: 25,
    defaults: { weight: 0.38 },
    brush: {
      angleDeg: 25,
      chiselAspect: 0.55,
      drySplit: 1.15,
      taper: 0.08,
      hang: 0,
    },
    guide: {
      // Aref Ruqaa is designed after classical Ruqʿah
      fontFamily: '"Aref Ruqaa", "Noto Naskh Arabic", serif',
      fontStyle: "normal",
      fontWeight: "400",
      letterSpacing: "0",
      opacity: 0.15,
      scale: 0.52,
    },
    gridKind: "baseline",
  },

  thuluth: {
    id: "thuluth",
    arabicName: "الثلث",
    englishName: "Thuluth",
    family: "six-pens",
    description:
      "Ceremonial script with tall curves. On screen we use a large book face as a study model — a real master writes this with a reed pen.",
    penAngleDeg: 35,
    defaults: { weight: 0.68 },
    brush: {
      angleDeg: 35,
      chiselAspect: 0.3,
      drySplit: 0.7,
      taper: 0.16,
      hang: 0,
    },
    guide: {
      fontFamily: '"Amiri", "Noto Naskh Arabic", serif',
      fontStyle: "normal",
      fontWeight: "700",
      letterSpacing: "0.02em",
      opacity: 0.14,
      scale: 0.5,
    },
    gridKind: "baseline",
  },

  muhaqqaq: {
    id: "muhaqqaq",
    arabicName: "المحقَّق",
    englishName: "Muhaqqaq",
    family: "six-pens",
    description:
      "Majestic, open classical hand. Screen model uses a bold book naskh as a practice shape.",
    penAngleDeg: 38,
    defaults: { weight: 0.65 },
    brush: {
      angleDeg: 38,
      chiselAspect: 0.28,
      drySplit: 0.65,
      taper: 0.14,
      hang: 0,
    },
    guide: {
      fontFamily: '"Amiri", "Noto Naskh Arabic", serif',
      fontStyle: "normal",
      fontWeight: "400",
      letterSpacing: "0.03em",
      opacity: 0.14,
      scale: 0.52,
    },
    gridKind: "baseline",
  },

  kufic: {
    id: "kufic",
    arabicName: "الكوفي",
    englishName: "Kufic",
    family: "early",
    description:
      "Early angular script — strong horizontals and square geometry (not soft curves).",
    penAngleDeg: 15,
    defaults: { weight: 0.72 },
    brush: {
      angleDeg: 15,
      chiselAspect: 0.7,
      drySplit: 0.5,
      taper: 0.04,
      hang: 0,
    },
    guide: {
      // Reem Kufi is a modern kufi-family face
      fontFamily: '"Reem Kufi", "Noto Kufi Arabic", sans-serif',
      fontStyle: "normal",
      fontWeight: "500",
      letterSpacing: "0.06em",
      opacity: 0.15,
      scale: 0.44,
    },
    gridKind: "square",
  },

  diwani: {
    id: "diwani",
    arabicName: "الديواني",
    englishName: "Diwani",
    family: "ottoman",
    description:
      "Ottoman court hand — fluid and tightly packed. Screen model is a flowing study face.",
    penAngleDeg: 25,
    defaults: { weight: 0.5 },
    brush: {
      angleDeg: 25,
      chiselAspect: 0.4,
      drySplit: 0.85,
      taper: 0.12,
      hang: 0.1,
    },
    guide: {
      fontFamily: '"Mirza", "Amiri", serif',
      fontStyle: "normal",
      fontWeight: "500",
      letterSpacing: "0",
      opacity: 0.14,
      scale: 0.52,
    },
    gridKind: "baseline",
  },

  maghrebi: {
    id: "maghrebi",
    arabicName: "المغربي",
    englishName: "Maghrebi",
    family: "regional",
    description:
      "Western Islamic hand — deep round bowls and softer curves (North Africa / Andalus).",
    penAngleDeg: 20,
    defaults: { weight: 0.55 },
    brush: {
      angleDeg: 20,
      chiselAspect: 0.48,
      drySplit: 0.75,
      taper: 0.14,
      hang: 0,
    },
    guide: {
      fontFamily: '"Harmattan", "Noto Naskh Arabic", sans-serif',
      fontStyle: "normal",
      fontWeight: "400",
      letterSpacing: "0.02em",
      opacity: 0.15,
      scale: 0.52,
    },
    gridKind: "baseline",
  },

  nastaliq: {
    id: "nastaliq",
    arabicName: "النستعليق",
    englishName: "Nastaʿliq",
    family: "persianate",
    description:
      "Persianate hanging script — words cascade down right to left. Uses a true Nastaʿliq typeface.",
    penAngleDeg: 55,
    defaults: { weight: 0.45 },
    brush: {
      angleDeg: 55,
      chiselAspect: 0.34,
      drySplit: 0.8,
      taper: 0.18,
      hang: 0.5,
    },
    guide: {
      fontFamily: '"Gulzar", "Noto Nastaliq Urdu", serif',
      fontStyle: "normal",
      fontWeight: "400",
      letterSpacing: "0",
      opacity: 0.14,
      scale: 0.48,
    },
    gridKind: "hanging",
  },
};

/** Calligraphy picker order — Naskh first (foundation). */
const STYLE_ORDER = [
  "naskh",
  "ruqah",
  "thuluth",
  "muhaqqaq",
  "kufic",
  "diwani",
  "maghrebi",
  "nastaliq",
];

function getStyleProfile(id) {
  return STYLE_PROFILES[id] || STYLE_PROFILES.naskh;
}
