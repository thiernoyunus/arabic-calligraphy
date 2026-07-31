/**
 * On-screen Arabic keyboard for people without an Arabic hardware layout.
 * Layout mirrors a common Arabic phone/desktop keyboard (RTL).
 * Designed with large hit targets for fingers and Apple Pencil taps on iPad.
 */
const ARABIC_KEYBOARD = {
  // Primary letter rows (visual order left→right; container is dir=rtl so
  // first key appears on the right — natural Arabic typing direction).
  letters: [
    ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
    ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
    ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"],
  ],
  // Shift / alternate forms + common extras
  shift: [
    ["َ", "ً", "ُ", "ٌ", "ِ", "ٍ", "ْ", "ّ", "ٓ", "ٰ", "ٔ", "ٕ"],
    ["أ", "إ", "آ", "ة", "ى", "ء", "ؤ", "ئ", "لآ", "لأ", "لإ", "لا"],
    ["ذ", "د", "ز", "ر", "و", "ى", "ة", "ث", "ح", "خ"],
  ],
  // Common marks people need when practicing Qur'anic / vocalized text
  marks: ["َ", "ُ", "ِ", "ّ", "ْ", "ً", "ٌ", "ٍ", "ـ"],
};

/**
 * Mount a keyboard into `rootEl`.
 * onChange(text) fires after every edit.
 * onCommit(text) fires when user taps Practice / Enter.
 */
function mountArabicKeyboard(
  rootEl,
  { getValue, getLanguage, setValue, onChange, onCommit }
) {
  let shifted = false;
  let marksOpen = false;

  rootEl.classList.add("ar-keyboard");
  rootEl.setAttribute("role", "group");
  rootEl.dir = "rtl";

  const language = () => (getLanguage?.() === "ar" ? "ar" : "en");
  const label = (en, ar) => (language() === "ar" ? ar : en);

  const rowsEl = document.createElement("div");
  rowsEl.className = "ar-kb-rows";
  rootEl.appendChild(rowsEl);

  const toolbar = document.createElement("div");
  toolbar.className = "ar-kb-toolbar";
  toolbar.dir = "ltr";
  rootEl.appendChild(toolbar);

  function currentText() {
    return getValue() || "";
  }

  function emit(text) {
    setValue(text);
    onChange?.(text);
  }

  function insert(ch) {
    emit(currentText() + ch);
  }

  function backspace() {
    const t = currentText();
    // Delete one Unicode code point (handles Arabic correctly better than length-1)
    const chars = [...t];
    chars.pop();
    emit(chars.join(""));
  }

  function clearAll() {
    emit("");
  }

  function makeKey(label, opts = {}) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ar-key" + (opts.wide ? " wide" : "") + (opts.action ? " action" : "");
    btn.textContent = label;
    if (opts.title) btn.title = opts.title;
    if (opts.aria) btn.setAttribute("aria-label", opts.aria);
    // Prevent focus steal / iOS zoom quirks; keep input in sync without OS keyboard
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
    });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      opts.onClick?.();
    });
    return btn;
  }

  function renderRows() {
    rowsEl.innerHTML = "";
    const grid = shifted ? ARABIC_KEYBOARD.shift : ARABIC_KEYBOARD.letters;

    for (const row of grid) {
      const rowEl = document.createElement("div");
      rowEl.className = "ar-kb-row";
      for (const ch of row) {
        rowEl.appendChild(
          makeKey(ch, {
            title: ch,
            onClick: () => insert(ch),
          })
        );
      }
      rowsEl.appendChild(rowEl);
    }

    // Bottom action row: shift · space · backspace · practice
    const actions = document.createElement("div");
    actions.className = "ar-kb-row actions";

    const shiftBtn = makeKey(shifted ? "أب" : "ًَُ", {
      action: true,
      wide: true,
      title: shifted ? label("Letters", "حروف") : label("Marks and forms", "تشكيل وأشكال"),
      aria: shifted
        ? label("Show letters", "إظهار الحروف")
        : label("Show marks and alternate forms", "إظهار التشكيل والأشكال الأخرى"),
      onClick: () => {
        shifted = !shifted;
        renderRows();
        renderToolbar();
      },
    });
    shiftBtn.classList.toggle("active", shifted);

    actions.appendChild(shiftBtn);
    actions.appendChild(
      makeKey(label("Space", "مسافة"), {
        action: true,
        wide: true,
        title: label("Space", "مسافة"),
        aria: label("Space", "مسافة"),
        onClick: () => insert(" "),
      })
    );
    actions.appendChild(
      makeKey("⌫", {
        action: true,
        title: label("Backspace", "حذف"),
        aria: label("Backspace", "حذف"),
        onClick: () => backspace(),
      })
    );
    actions.appendChild(
      makeKey(label("Practice", "تمرّن"), {
        action: true,
        wide: true,
        title: label("Practice this word", "تدرّب على هذه الكلمة"),
        aria: label("Practice", "تمرّن"),
        onClick: () => {
          const t = currentText().trim();
          if (t) onCommit?.(t);
        },
      })
    );

    rowsEl.appendChild(actions);

    if (marksOpen) {
      const marksRow = document.createElement("div");
      marksRow.className = "ar-kb-row marks";
      for (const m of ARABIC_KEYBOARD.marks) {
        marksRow.appendChild(
          makeKey(m === "ـ" ? "ـ" : m, {
            title: "Harakat / tatweel",
            onClick: () => insert(m),
          })
        );
      }
      rowsEl.appendChild(marksRow);
    }
  }

  function renderToolbar() {
    toolbar.innerHTML = "";
    rootEl.setAttribute(
      "aria-label",
      label("Arabic keyboard", "لوحة مفاتيح عربية")
    );
    const marksToggle = document.createElement("button");
    marksToggle.type = "button";
    marksToggle.className = "ar-kb-chip" + (marksOpen ? " active" : "");
    marksToggle.textContent = label("Marks", "تشكيل");
    marksToggle.addEventListener("click", () => {
      marksOpen = !marksOpen;
      renderRows();
      renderToolbar();
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "ar-kb-chip";
    clearBtn.textContent = label("Clear text", "مسح النص");
    clearBtn.addEventListener("click", () => clearAll());

    const hint = document.createElement("span");
    hint.className = "ar-kb-hint";
    hint.textContent = label(
      "Use these keys to type Arabic.",
      "استخدم هذه المفاتيح للكتابة بالعربية."
    );

    toolbar.appendChild(hint);
    toolbar.appendChild(marksToggle);
    toolbar.appendChild(clearBtn);
  }

  renderToolbar();
  renderRows();

  return {
    refresh: () => {
      renderRows();
      renderToolbar();
    },
  };
}
