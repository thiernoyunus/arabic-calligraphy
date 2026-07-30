/**
 * Arabic letter practice set — forms, meanings, and stroke hints.
 * Stroke points are relative (0–1) within the canvas square for guide dots.
 */
const LETTERS = [
  {
    char: "ا",
    name: "alif",
    meaning: "alif",
    strokes: [{ x: 0.5, y: 0.18, label: "1" }],
    tip: "Write alif as a single vertical descending stroke.",
  },
  {
    char: "ب",
    name: "ba",
    meaning: "ba",
    strokes: [
      { x: 0.72, y: 0.42, label: "1" },
      { x: 0.5, y: 0.68, label: "2" },
    ],
    tip: "Bowl first, then the single basmalah-dot below.",
  },
  {
    char: "ت",
    name: "ta",
    meaning: "ta",
    strokes: [
      { x: 0.72, y: 0.42, label: "1" },
      { x: 0.42, y: 0.28, label: "2" },
      { x: 0.58, y: 0.28, label: "3" },
    ],
    tip: "Same bowl as ba; two dots above.",
  },
  {
    char: "ث",
    name: "tha",
    meaning: "tha",
    strokes: [
      { x: 0.72, y: 0.42, label: "1" },
      { x: 0.5, y: 0.24, label: "2" },
    ],
    tip: "Bowl, then three dots above.",
  },
  {
    char: "ج",
    name: "jim",
    meaning: "jim",
    strokes: [
      { x: 0.62, y: 0.3, label: "1" },
      { x: 0.48, y: 0.58, label: "2" },
    ],
    tip: "Upper curve, then deep lower bowl with one dot inside.",
  },
  {
    char: "ح",
    name: "ha",
    meaning: "ḥa",
    strokes: [{ x: 0.62, y: 0.32, label: "1" }],
    tip: "Same skeleton as jim, without the dot.",
  },
  {
    char: "خ",
    name: "kha",
    meaning: "kha",
    strokes: [
      { x: 0.62, y: 0.32, label: "1" },
      { x: 0.52, y: 0.22, label: "2" },
    ],
    tip: "Ha body with one dot above.",
  },
  {
    char: "د",
    name: "dal",
    meaning: "dal",
    strokes: [{ x: 0.58, y: 0.38, label: "1" }],
    tip: "A compact rightward hook — keep it short.",
  },
  {
    char: "ذ",
    name: "dhal",
    meaning: "dhal",
    strokes: [
      { x: 0.58, y: 0.38, label: "1" },
      { x: 0.52, y: 0.24, label: "2" },
    ],
    tip: "Dal with a single dot above.",
  },
  {
    char: "ر",
    name: "ra",
    meaning: "ra",
    strokes: [{ x: 0.55, y: 0.4, label: "1" }],
    tip: "A curved descending stroke that sits on the baseline.",
  },
  {
    char: "ز",
    name: "zay",
    meaning: "zay",
    strokes: [
      { x: 0.55, y: 0.4, label: "1" },
      { x: 0.5, y: 0.26, label: "2" },
    ],
    tip: "Ra with one dot above.",
  },
  {
    char: "س",
    name: "sin",
    meaning: "sin",
    strokes: [
      { x: 0.78, y: 0.45, label: "1" },
      { x: 0.55, y: 0.45, label: "2" },
      { x: 0.32, y: 0.5, label: "3" },
    ],
    tip: "Three teeth flowing into a final bowl — keep teeth even.",
  },
  {
    char: "ش",
    name: "shin",
    meaning: "shin",
    strokes: [
      { x: 0.78, y: 0.45, label: "1" },
      { x: 0.5, y: 0.26, label: "2" },
    ],
    tip: "Sin body with three dots above.",
  },
  {
    char: "ص",
    name: "sad",
    meaning: "ṣad",
    strokes: [
      { x: 0.7, y: 0.4, label: "1" },
      { x: 0.38, y: 0.52, label: "2" },
    ],
    tip: "Closed loop (ṣad head), then the final bowl.",
  },
  {
    char: "ض",
    name: "dad",
    meaning: "ḍad",
    strokes: [
      { x: 0.7, y: 0.4, label: "1" },
      { x: 0.55, y: 0.24, label: "2" },
    ],
    tip: "Sad with one dot above.",
  },
  {
    char: "ط",
    name: "ta",
    meaning: "ṭa",
    strokes: [
      { x: 0.55, y: 0.55, label: "1" },
      { x: 0.55, y: 0.28, label: "2" },
    ],
    tip: "Oval base, then the tall vertical stem.",
  },
  {
    char: "ظ",
    name: "za",
    meaning: "ẓa",
    strokes: [
      { x: 0.55, y: 0.55, label: "1" },
      { x: 0.62, y: 0.28, label: "2" },
    ],
    tip: "Ta with one dot above the oval.",
  },
  {
    char: "ع",
    name: "ayn",
    meaning: "ayn",
    strokes: [
      { x: 0.58, y: 0.3, label: "1" },
      { x: 0.48, y: 0.58, label: "2" },
    ],
    tip: "Open upper eye, then deep lower curve.",
  },
  {
    char: "غ",
    name: "ghayn",
    meaning: "ghayn",
    strokes: [
      { x: 0.58, y: 0.3, label: "1" },
      { x: 0.52, y: 0.2, label: "2" },
    ],
    tip: "Ayn with one dot above.",
  },
  {
    char: "ف",
    name: "fa",
    meaning: "fa",
    strokes: [
      { x: 0.58, y: 0.48, label: "1" },
      { x: 0.55, y: 0.28, label: "2" },
    ],
    tip: "Loop head, descending body, one dot above.",
  },
  {
    char: "ق",
    name: "qaf",
    meaning: "qaf",
    strokes: [
      { x: 0.58, y: 0.48, label: "1" },
      { x: 0.5, y: 0.26, label: "2" },
    ],
    tip: "Deeper final bowl than fa; two dots above.",
  },
  {
    char: "ك",
    name: "kaf",
    meaning: "kaf",
    strokes: [
      { x: 0.62, y: 0.28, label: "1" },
      { x: 0.48, y: 0.55, label: "2" },
    ],
    tip: "Vertical stem with the small hamza-like mark, then base.",
  },
  {
    char: "ل",
    name: "lam",
    meaning: "lam",
    strokes: [{ x: 0.55, y: 0.22, label: "1" }],
    tip: "Tall descending stroke into a gentle terminal curve.",
  },
  {
    char: "م",
    name: "mim",
    meaning: "mim",
    strokes: [
      { x: 0.55, y: 0.4, label: "1" },
      { x: 0.48, y: 0.62, label: "2" },
    ],
    tip: "Closed head, then the descending tail.",
  },
  {
    char: "ن",
    name: "nun",
    meaning: "nun",
    strokes: [
      { x: 0.62, y: 0.45, label: "1" },
      { x: 0.5, y: 0.32, label: "2" },
    ],
    tip: "Open bowl with one dot above.",
  },
  {
    char: "ه",
    name: "ha",
    meaning: "ha",
    strokes: [{ x: 0.5, y: 0.45, label: "1" }],
    tip: "Rounded closed form — keep the loop full.",
  },
  {
    char: "و",
    name: "waw",
    meaning: "waw",
    strokes: [{ x: 0.52, y: 0.42, label: "1" }],
    tip: "Small head loop, then a curved descending tail.",
  },
  {
    char: "ي",
    name: "ya",
    meaning: "ya",
    strokes: [
      { x: 0.68, y: 0.42, label: "1" },
      { x: 0.5, y: 0.68, label: "2" },
    ],
    tip: "Returning bowl with two dots below.",
  },
  {
    char: "لا",
    name: "lam-alif",
    meaning: "lā",
    strokes: [
      { x: 0.42, y: 0.22, label: "1" },
      { x: 0.62, y: 0.28, label: "2" },
    ],
    tip: "Lam first, then alif crossing or joining.",
  },
  {
    char: "الله",
    name: "allah",
    meaning: "Allāh",
    strokes: [
      { x: 0.78, y: 0.28, label: "1" },
      { x: 0.55, y: 0.35, label: "2" },
      { x: 0.35, y: 0.3, label: "3" },
    ],
    tip: "Sacred form — keep proportions balanced and dignified.",
  },
  {
    char: "سلام",
    name: "salam",
    meaning: "peace",
    strokes: [
      { x: 0.82, y: 0.42, label: "1" },
      { x: 0.55, y: 0.4, label: "2" },
      { x: 0.28, y: 0.45, label: "3" },
    ],
    tip: "Practice connecting sin → lam → alif → mim as one flowing word.",
  },
  {
    char: "حب",
    name: "hub",
    meaning: "love",
    strokes: [
      { x: 0.68, y: 0.35, label: "1" },
      { x: 0.4, y: 0.5, label: "2" },
    ],
    tip: "Ha then ba — keep the connection smooth on the baseline.",
  },
  {
    char: "نور",
    name: "nur",
    meaning: "light",
    strokes: [
      { x: 0.72, y: 0.4, label: "1" },
      { x: 0.5, y: 0.45, label: "2" },
      { x: 0.32, y: 0.48, label: "3" },
    ],
    tip: "Nun → waw → ra. Let the word breathe.",
  },
  {
    char: "حق",
    name: "haqq",
    meaning: "truth",
    strokes: [
      { x: 0.68, y: 0.35, label: "1" },
      { x: 0.4, y: 0.45, label: "2" },
    ],
    tip: "Ha into qaf — qaf’s deep bowl needs room below the line.",
  },
  {
    char: "علم",
    name: "ilm",
    meaning: "knowledge",
    strokes: [
      { x: 0.75, y: 0.35, label: "1" },
      { x: 0.52, y: 0.4, label: "2" },
      { x: 0.3, y: 0.48, label: "3" },
    ],
    tip: "Ayn → lam → mim. Classic practice word for flow.",
  },
  {
    char: "بسم",
    name: "bism",
    meaning: "in the name",
    strokes: [
      { x: 0.8, y: 0.45, label: "1" },
      { x: 0.55, y: 0.4, label: "2" },
      { x: 0.32, y: 0.42, label: "3" },
    ],
    tip: "Opening of the basmala — write with care and even spacing.",
  },
];

const PRESETS = [
  "ا", "ب", "ت", "ج", "س", "ع", "ل", "م", "ن", "ه", "و", "ي",
  "الله", "سلام", "حب", "نور", "حق", "علم",
];

function findLetter(text) {
  const t = (text || "").trim();
  if (!t) return null;
  return LETTERS.find((l) => l.char === t) || {
    char: t,
    name: "custom",
    meaning: t,
    strokes: [{ x: 0.5, y: 0.35, label: "1" }],
    tip: "Free practice — follow the guide letter and keep to the baseline.",
  };
}
