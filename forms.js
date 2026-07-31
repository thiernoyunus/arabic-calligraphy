/**
 * Arabic letter forms for Writing mode practice.
 *
 * Uses tatweel (ـ, kashida) so the browser shows join shapes:
 *   Alone · Start · Middle · End
 * the same way learners see them in workbooks.
 *
 * Tatweel is more reliable on canvas than Zero-Width Joiner alone.
 */

/** Letters that do not connect to the following letter (left side). */
const NON_JOINERS = new Set([
  "ا",
  "أ",
  "إ",
  "آ",
  "ٱ",
  "د",
  "ذ",
  "ر",
  "ز",
  "و",
  "ؤ",
  "ة", // often treated as non-joining left in teaching
]);

/** Tatweel (kashida) — connection bar for teaching forms */
const TATWEEL = "\u0640";

/** Core 28-letter practice alphabet (isolated base characters). */
const ALPHABET = [
  { char: "ا", name: "alif", nameAr: "ألف" },
  { char: "ب", name: "ba", nameAr: "باء" },
  { char: "ت", name: "ta", nameAr: "تاء" },
  { char: "ث", name: "tha", nameAr: "ثاء" },
  { char: "ج", name: "jim", nameAr: "جيم" },
  { char: "ح", name: "ha", nameAr: "حاء" },
  { char: "خ", name: "kha", nameAr: "خاء" },
  { char: "د", name: "dal", nameAr: "دال" },
  { char: "ذ", name: "dhal", nameAr: "ذال" },
  { char: "ر", name: "ra", nameAr: "راء" },
  { char: "ز", name: "zay", nameAr: "زاي" },
  { char: "س", name: "sin", nameAr: "سين" },
  { char: "ش", name: "shin", nameAr: "شين" },
  { char: "ص", name: "sad", nameAr: "صاد" },
  { char: "ض", name: "dad", nameAr: "ضاد" },
  { char: "ط", name: "tta", nameAr: "طاء" },
  { char: "ظ", name: "zza", nameAr: "ظاء" },
  { char: "ع", name: "ayn", nameAr: "عين" },
  { char: "غ", name: "ghayn", nameAr: "غين" },
  { char: "ف", name: "fa", nameAr: "فاء" },
  { char: "ق", name: "qaf", nameAr: "قاف" },
  { char: "ك", name: "kaf", nameAr: "كاف" },
  { char: "ل", name: "lam", nameAr: "لام" },
  { char: "م", name: "mim", nameAr: "ميم" },
  { char: "ن", name: "nun", nameAr: "نون" },
  { char: "ه", name: "ha", nameAr: "هاء" },
  { char: "و", name: "waw", nameAr: "واو" },
  { char: "ي", name: "ya", nameAr: "ياء" },
];

const FORM_META = [
  { id: "isolated", labelEn: "Alone", labelAr: "منفصل", hint: "by itself" },
  { id: "initial", labelEn: "Start", labelAr: "أول", hint: "beginning of a word" },
  { id: "medial", labelEn: "Middle", labelAr: "وسط", hint: "joined both sides" },
  { id: "final", labelEn: "End", labelAr: "آخر", hint: "end of a word" },
];

/** Connect drill: start + middle + end joined as a mini-word */
const CHAIN_META = {
  id: "chain",
  labelEn: "Connect",
  labelAr: "وصل",
  hint: "start + middle + end joined",
};

function isNonJoiner(char) {
  if (!char) return false;
  return NON_JOINERS.has([...char][0]);
}

/**
 * Return display strings for the four positions.
 * For non-joiners, start/middle often match alone — we still expose slots
 * and mark connectsLeft so the UI can explain.
 *
 * Visuals:
 *   Alone  → ب
 *   Start  → بـ   (letter + connection to the left)
 *   Middle → ـبـ  (joined both sides)
 *   End    → ـب   (joined from the right)
 */
function getLetterForms(char) {
  const base = (char || "").trim();
  if (!base) {
    return {
      base: "",
      connectsLeft: false,
      forms: {
        isolated: "",
        initial: "",
        medial: "",
        final: "",
      },
    };
  }

  const c = [...base][0]; // first code point
  const connectsLeft = !isNonJoiner(c);

  return {
    base: c,
    connectsLeft,
    forms: {
      isolated: c,
      // Tatweel forces joined presentation forms + shows the connection bar
      initial: connectsLeft ? c + TATWEEL : c,
      medial: connectsLeft ? TATWEEL + c + TATWEEL : c,
      final: TATWEEL + c,
    },
  };
}

/**
 * Three of the same letter. Arabic shaping turns joiners into
 * start → middle → end so the learner sees how the letter connects.
 * e.g. ببب
 */
function getChainPractice(char) {
  const c = [...(char || "").trim()][0];
  if (!c) return "";
  return c + c + c;
}

/**
 * Short practice words per letter — 2–4 simple Arabic words.
 * Words were chosen to be common and short (Iqra-style drills).
 */
const PRACTICE_WORDS = {
  ا: ["باب", "ماء", "كتاب"],
  ب: ["باب", "بيت", "حب", "كتاب"],
  ت: ["توت", "بيت", "كتاب"],
  ث: ["ثمر", "ثلاثة", "ثوب"],
  ج: ["جمل", "كتاب", "نجم"],
  ح: ["حب", "حوت", "بحر"],
  خ: ["خبز", "أخ", "نخلة"],
  د: ["يد", "ورد", "دار"],
  ذ: ["ذهب", "ذرة", "أذن"],
  ر: ["ورد", "نار", "قمر"],
  ز: ["زهر", "رز", "موز"],
  س: ["سمكة", "شمس", "أسد"],
  ش: ["شمس", "شاي", "قلم"],
  ص: ["صباح", "عصفور", "قصة"],
  ض: ["ضوء", "أرض", "بيض"],
  ط: ["طائر", "مطر", "قط"],
  ظ: ["ظل", "عظم", "ظهر"],
  ع: ["عين", "علم", "قلم"],
  غ: ["غيم", "غزال", "صمغ"],
  ف: ["فيل", "تفاح", "كتاب"],
  ق: ["قمر", "قلم", "قطة"],
  ك: ["كتاب", "كلب", "سمك"],
  ل: ["لبن", "قلم", "لحم"],
  م: ["ماء", "قلم", "أم"],
  ن: ["نار", "لبن", "نون"],
  ه: ["هلال", "نهر", "وجه"],
  و: ["ورد", "ولد", "نور"],
  ي: ["يد", "بيت", "كتاب"],
};

function getPracticeWords(char) {
  const c = [...(char || "").trim()][0];
  return PRACTICE_WORDS[c] || [];
}

/** Pick a different practice word that includes the letter being studied. */
function randomAlphabetPracticeWord(char, avoid) {
  const c = [...(char || "").trim()][0];
  const words = getPracticeWords(c).filter((word) => word.includes(c));
  const choices = words.filter((word) => word !== avoid);
  const pool = choices.length ? choices : words;
  return pool[Math.floor(Math.random() * pool.length)] || "";
}

function getAlphabetEntry(char) {
  const c = (char || "").trim();
  return ALPHABET.find((a) => a.char === c) || null;
}
