(() => {
  const paperCanvas = document.getElementById("paper");
  const ghostCanvas = document.getElementById("ghost");
  const inkCanvas = document.getElementById("ink");
  const canvasWrap = document.getElementById("canvasWrap");
  const qalamCursor = document.getElementById("qalamCursor");
  const strokeNumbers = document.getElementById("strokeNumbers");
  const charBadge = document.getElementById("charBadge");
  const strokeCountEl = document.getElementById("strokeCount");
  const typeInput = document.getElementById("typeInput");
  const presetsEl = document.getElementById("presets");
  const hint = document.getElementById("hint");
  const hintText = document.getElementById("hintText");
  const showMeBtn = document.getElementById("showMeBtn");
  const styleSeg = document.getElementById("styleSeg");
  const kbHost = document.getElementById("arabicKeyboard");
  const kbToggle = document.getElementById("kbToggle");
  const kbDock = document.getElementById("kbDock");

  const paper = new PaperSurface(paperCanvas);
  const brush = new BrushEngine(inkCanvas);

  const state = {
    /** writing = alphabet & forms; calligraphy = styles & pen feel */
    practice: "writing",
    surface: "plain",
    mode: "write",
    style: "naskh",
    /** Faint model on paper for tracing (UI label: guide) */
    ghost: true,
    playSpeed: 1,
    teaching: false,
    showMeasures: true,
    /** base letter for writing mode (e.g. ب) */
    alphabetChar: "ب",
    /** isolated | initial | medial | final | chain — Connect first (Iqra-style) */
    formId: "chain",
    /** form | chain | word */
    drillKind: "chain",
    /** practice word string when drillKind === 'word' */
    wordPractice: null,
    /** Model text size on paper (1 = default; long phrases still auto-fit) */
    textSize: 1,
    current: findLetter("ببب"),
    kbOpen: true,
    hasWatched: false,
    uiLanguage: (() => {
      try {
        return localStorage.getItem("ink-ui-language") === "ar" ? "ar" : "en";
      } catch (_) {
        return "en";
      }
    })(),
  };

  const UI = {
    en: {
      forms: "Letter forms",
      words: "Practice words",
      hideKeyboard: "Hide keyboard",
      showKeyboard: "Show keyboard",
      typeArabic: "Type Arabic",
      randomWord: "Random word",
      pen: "Pen",
      eraser: "Eraser",
      undo: "Undo",
      clear: "Clear page",
      watch: "Watch the stroke order",
      watching: "Writing…",
      watchAgain: "Watch again",
      traceOn: "Tracing outline: on",
      traceOff: "Tracing outline: off",
      penSize: "Pen size",
      textSize: "Text size",
      writingHelp: "Watch first, then trace the light outline on the paper.",
      outlineHelp: "The tracing outline stays on while you practice.",
      outlineSettings: "Changes the tracing outline on the paper.",
      paper: "Paper",
      plain: "Plain",
      lines: "Lines",
      watchTitle: "Watch the stroke order",
      watchHelp: "Watch once. The paper will reset to the tracing outline for your turn.",
      yourTurn: "Your turn — trace the light outline.",
      randomHint: "Random word · {word}. Watch the stroke order, then trace the light outline.",
    },
    ar: {
      forms: "أشكال الحروف",
      words: "كلمات للتدريب",
      hideKeyboard: "إخفاء لوحة المفاتيح",
      showKeyboard: "إظهار لوحة المفاتيح",
      typeArabic: "اكتب بالعربية",
      randomWord: "كلمة عشوائية",
      pen: "قلم",
      eraser: "ممحاة",
      undo: "تراجع",
      clear: "مسح الصفحة",
      watch: "شاهد ترتيب الخطوات",
      watching: "جارٍ العرض…",
      watchAgain: "شاهد مرة أخرى",
      traceOn: "نموذج التتبع: ظاهر",
      traceOff: "نموذج التتبع: مخفي",
      penSize: "حجم القلم",
      textSize: "حجم النص",
      writingHelp: "شاهد أولًا، ثم تتبع النموذج الفاتح على الورقة.",
      outlineHelp: "يبقى نموذج التتبع ظاهرًا أثناء التدريب.",
      outlineSettings: "يغيّر نموذج التتبع على الورقة.",
      paper: "الورق",
      plain: "سادة",
      lines: "سطور",
      watchTitle: "شاهد ترتيب الخطوات",
      watchHelp: "شاهد مرة، ثم تعود الورقة إلى نموذج التتبع لتجرب بنفسك.",
      yourTurn: "حان دورك — تتبع النموذج الفاتح.",
      randomHint: "كلمة عشوائية · {word}. شاهد ترتيب الخطوات ثم تتبع النموذج الفاتح.",
    },
  };

  let keyboardController = null;

  function t(key, values = {}) {
    let text = UI[state.uiLanguage][key] || UI.en[key] || key;
    for (const [name, value] of Object.entries(values)) {
      text = text.replace(`{${name}}`, value);
    }
    return text;
  }

  function setUiText(id, key) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

  function showMeLabel() {
    if (state.teaching) return t("watching");
    return t(state.hasWatched ? "watchAgain" : "watch");
  }

  function syncActionLabels() {
    const label = showMeLabel();
    [teachPlayBtn, showMeBtn, writingShowMeBtn, dockShowMeBtn]
      .filter(Boolean)
      .forEach((btn) => {
        btn.textContent = label;
        btn.setAttribute("aria-label", label);
      });
  }

  function setUiLanguage(language) {
    state.uiLanguage = language === "ar" ? "ar" : "en";
    const appEl = document.querySelector(".app");
    if (appEl) appEl.dataset.uiLanguage = state.uiLanguage;
    document.documentElement.lang = state.uiLanguage;
    document.querySelectorAll("[data-ui-language-choice]").forEach((btn) => {
      const on = btn.dataset.uiLanguageChoice === state.uiLanguage;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    setUiText("penToolBtn", "pen");
    setUiText("eraseToolBtn", "eraser");
    setUiText("undoBtn", "undo");
    setUiText("clearBtn", "clear");
    setUiText("randomWordBtn", "randomWord");
    if (typeInput) typeInput.placeholder = t("typeArabic");
    if (kbToggle) {
      kbToggle.textContent = t(state.kbOpen ? "hideKeyboard" : "showKeyboard");
    }
    syncGhostUi();
    syncActionLabels();
    keyboardController?.refresh?.();
    rebuildStyleButtonsForPractice();
    buildAlphabet();
    buildForms();
    buildPracticeWords();
    if (state.practice === "writing") refreshWritingHint();
    else {
      const styleHint = document.getElementById("styleHint");
      if (styleHint) {
        styleHint.textContent =
          state.uiLanguage === "ar"
            ? "اختر نوع الخط الذي تريد التدريب عليه."
            : getStyleProfile(state.style).description;
      }
      updateHint();
    }
    try {
      localStorage.setItem("ink-ui-language", state.uiLanguage);
    } catch (_) {
      /* language still works for this visit */
    }
  }

  // ── size ──────────────────────────────────────────────
  function cssSize() {
    return canvasWrap.getBoundingClientRect().width;
  }

  function resizeGhost(cssS) {
    if (!ghostCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ghostCanvas.width = Math.round(cssS * dpr);
    ghostCanvas.height = Math.round(cssS * dpr);
    ghostCanvas.style.width = `${cssS}px`;
    ghostCanvas.style.height = `${cssS}px`;
    const gctx = ghostCanvas.getContext("2d");
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resize() {
    const s = cssSize();
    paper.resize(s);
    brush.resize(s);
    resizeGhost(s);
    updateGuides();
  }

  // ── UI bindings ───────────────────────────────────────
  /** One control: pen size. Other ink knobs were removed (wetness, speed, formality, seed). */
  function setPenSize(n) {
    const v = Math.max(0, Math.min(1, Number(n) || 0.5));
    brush.setParams({ weight: v });
    if (qalamCursor?.classList.contains("is-erasing")) {
      const eraserSize = 20 + v * 40;
      qalamCursor.style.width = `${eraserSize}px`;
      qalamCursor.style.height = `${eraserSize}px`;
      qalamCursor.style.transform = `translate(${-eraserSize / 2}px, ${-eraserSize / 2}px)`;
    }
    const main = document.getElementById("weight");
    const mainVal = document.getElementById("weightVal");
    const ww = document.getElementById("writingWeight");
    const wwVal = document.getElementById("writingWeightVal");
    if (main && document.activeElement !== main) main.value = String(v);
    if (mainVal) mainVal.textContent = v.toFixed(2);
    if (ww && document.activeElement !== ww) ww.value = String(v);
    if (wwVal) wwVal.textContent = v.toFixed(2);
  }

  function setTextSize(n, opts = {}) {
    const v = Math.max(0.5, Math.min(1.5, Number(n) || 1));
    state.textSize = v;
    const ids = [
      ["textSize", "textSizeVal"],
      ["writingTextSize", "writingTextSizeVal"],
    ];
    for (const [id, valId] of ids) {
      const el = document.getElementById(id);
      const val = document.getElementById(valId);
      if (el && document.activeElement !== el) el.value = String(v);
      if (val) val.textContent = v.toFixed(2);
    }
    // Always redraw the faint guide for the current word at the new size
    if (typeof clearGlyphCache === "function") clearGlyphCache();
    if (!state.ghost) {
      setGhost(true);
    } else if (!opts.skipDraw) {
      updateGuides();
    }
  }

  function bindTextSizeSlider(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const apply = () => setTextSize(el.value);
    el.addEventListener("input", apply);
    el.addEventListener("change", apply);
  }

  function bindSliders() {
    const main = document.getElementById("weight");
    if (main) {
      main.addEventListener("input", () => setPenSize(main.value));
      setPenSize(main.value);
    }
    const writingWeight = document.getElementById("writingWeight");
    if (writingWeight) {
      writingWeight.addEventListener("input", () =>
        setPenSize(writingWeight.value)
      );
    }

    // Text size (model on paper) — both modes; updates guide live
    bindTextSizeSlider("textSize");
    bindTextSizeSlider("writingTextSize");
    setTextSize(state.textSize, { skipDraw: true });
  }

  function bindSeg(attr, key, onChange) {
    document.querySelectorAll(`[data-${attr}]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(`[data-${attr}]`)
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state[key] = btn.getAttribute(`data-${attr}`);
        onChange();
      });
    });
  }

  function doUndo() {
    brush.undo();
    updateCount();
  }

  function doClear() {
    brush.clear();
    updateCount();
  }

  document.getElementById("undoBtn")?.addEventListener("click", doUndo);
  document.getElementById("clearBtn")?.addEventListener("click", doClear);

  // Pen / Eraser — erase scrubs only the part you touch (not the whole paper)
  function setTool(tool) {
    const t = tool === "erase" ? "erase" : "ink";
    brush.setTool(t);
    qalamCursor?.classList.remove("visible");
    inkCanvas.style.cursor = "";
    document.querySelectorAll("[data-tool]").forEach((btn) => {
      const on = btn.dataset.tool === t;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (inkCanvas) {
      inkCanvas.classList.toggle("is-erasing", t === "erase");
      inkCanvas.style.cursor = t === "erase" ? "cell" : "crosshair";
    }
  }
  document.querySelectorAll("[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => setTool(btn.dataset.tool));
  });
  setTool("ink");

  const ghostGuide = document.getElementById("ghostGuide");
  const writingGhostGuide = document.getElementById("writingGhostGuide");
  const teachPlayBtn = document.getElementById("teachPlayBtn");
  const writingShowMeBtn = document.getElementById("writingShowMeBtn");

  const dockGhostBtn = document.getElementById("dockGhostBtn");
  const dockShowMeBtn = document.getElementById("dockShowMeBtn");
  /** Avoid checkbox change events undoing setGhost while we sync UI */
  let syncingGhostUi = false;

  function syncGhostUi() {
    if (dockGhostBtn) {
      dockGhostBtn.classList.toggle("active", !!state.ghost);
      dockGhostBtn.setAttribute("aria-pressed", state.ghost ? "true" : "false");
      dockGhostBtn.textContent = t(state.ghost ? "traceOn" : "traceOff");
    }
  }

  function setGhost(on) {
    state.ghost = !!on;
    syncingGhostUi = true;
    try {
      if (ghostGuide) ghostGuide.checked = state.ghost;
      if (writingGhostGuide) writingGhostGuide.checked = state.ghost;
    } finally {
      syncingGhostUi = false;
    }
    syncGhostUi();
    updateGuides();
  }

  if (ghostGuide) {
    ghostGuide.addEventListener("change", (e) => {
      if (syncingGhostUi) return;
      setGhost(e.target.checked);
    });
  }
  if (writingGhostGuide) {
    writingGhostGuide.addEventListener("change", (e) => {
      if (syncingGhostUi) return;
      setGhost(e.target.checked);
    });
  }
  if (dockGhostBtn) {
    dockGhostBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setGhost(!state.ghost);
    });
  }

  async function runShowMe() {
    if (state.teaching) return;
    state.teaching = true;
    const playBtns = [
      teachPlayBtn,
      showMeBtn,
      writingShowMeBtn,
      dockShowMeBtn,
    ].filter(Boolean);
    for (const b of playBtns) {
      b.disabled = true;
    }
    syncActionLabels();
    // Hide guide while Show me runs — two copies caused a double shadow
    updateGuides();
    try {
      await showMeStroke();
      await new Promise((resolve) => setTimeout(resolve, 700));
      brush.clear();
      updateCount();
      state.hasWatched = true;
      setGhost(true);
      if (hint && hintText) {
        hint.hidden = false;
        hintText.textContent = t("yourTurn");
      }
    } catch (err) {
      console.warn("Show me failed:", err);
    } finally {
      state.teaching = false;
      for (const b of playBtns) {
        b.disabled = false;
      }
      syncActionLabels();
      updateGuides();
    }
  }

  if (teachPlayBtn) teachPlayBtn.addEventListener("click", runShowMe);
  if (showMeBtn) showMeBtn.addEventListener("click", runShowMe);
  if (writingShowMeBtn) writingShowMeBtn.addEventListener("click", runShowMe);
  if (dockShowMeBtn) dockShowMeBtn.addEventListener("click", runShowMe);

  // ── drawing (mouse, finger, Apple Pencil via Pointer Events) ──
  function posFromEvent(e) {
    const rect = inkCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let pressure = 0.55;
    if (typeof e.pressure === "number" && e.pressure > 0) {
      pressure = e.pressure;
    }
    if (typeof e.tiltX === "number" && typeof e.tiltY === "number") {
      const tilt = Math.min(1, Math.hypot(e.tiltX, e.tiltY) / 60);
      pressure = Math.min(1, pressure * (0.85 + tilt * 0.3));
    }
    return { x, y, pressure };
  }

  function feedPointer(e, phase) {
    const coalesced =
      typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : null;
    const events = coalesced && coalesced.length ? coalesced : [e];
    for (const ev of events) {
      const { x, y, pressure } = posFromEvent(ev);
      if (phase === "down") brush.beginStroke(x, y, pressure);
      else if (phase === "move") brush.continueStroke(x, y, pressure);
    }
  }

  function onDown(e) {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    feedPointer(e, "down");
    try {
      inkCanvas.setPointerCapture(e.pointerId);
    } catch (_) {
      /* older browsers */
    }
  }

  function onMove(e) {
    if (!brush.drawing) return;
    e.preventDefault();
    feedPointer(e, "move");
  }

  function moveToolCursor(e) {
    if (!qalamCursor || e.pointerType !== "mouse") return;
    const erasing = brush.getTool() === "erase";
    const rect = inkCanvas.getBoundingClientRect();
    qalamCursor.style.left = `${e.clientX - rect.left}px`;
    qalamCursor.style.top = `${e.clientY - rect.top}px`;
    qalamCursor.classList.toggle("is-erasing", erasing);
    if (erasing) {
      const eraserSize = 20 + brush.params.weight * 40;
      qalamCursor.style.width = `${eraserSize}px`;
      qalamCursor.style.height = `${eraserSize}px`;
      qalamCursor.style.transform = `translate(${-eraserSize / 2}px, ${-eraserSize / 2}px)`;
    } else {
      qalamCursor.style.width = "36px";
      qalamCursor.style.height = "36px";
      qalamCursor.style.transform = "translate(-9px, -30px)";
    }
    qalamCursor.classList.add("visible");
    inkCanvas.style.cursor = "none";
  }

  function onUp(e) {
    if (!brush.drawing) return;
    e.preventDefault();
    brush.endStroke();
    updateCount();
  }

  inkCanvas.addEventListener("pointerdown", onDown);
  inkCanvas.addEventListener("pointermove", onMove);
  inkCanvas.addEventListener("pointerenter", moveToolCursor);
  inkCanvas.addEventListener("pointermove", moveToolCursor);
  inkCanvas.addEventListener("pointerup", onUp);
  inkCanvas.addEventListener("pointercancel", onUp);
  inkCanvas.addEventListener("pointerleave", (e) => {
    qalamCursor?.classList.remove("visible");
    inkCanvas.style.cursor = "";
    if (brush.drawing && e.pointerType === "mouse") onUp(e);
  });
  inkCanvas.addEventListener(
    "touchstart",
    (e) => {
      if (e.target === inkCanvas) e.preventDefault();
    },
    { passive: false }
  );

  // keyboard undo
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      e.preventDefault();
      brush.undo();
      updateCount();
    }
  });

  // ── styles (qalam profiles) ───────────────────────────
  function shortArabicLabel(profile) {
    // Compact button labels; full names live in title tooltips
    const map = {
      naskh: "نسخ",
      ruqah: "رقعة",
      thuluth: "ثلث",
      muhaqqaq: "محقّق",
      kufic: "كوفي",
      diwani: "ديواني",
      maghrebi: "مغربي",
      nastaliq: "نستعليق",
    };
    return map[profile.id] || profile.arabicName;
  }

  function buildStyleButtons() {
    rebuildStyleButtonsForPractice();
  }

  function applyStyle(styleId) {
    const profile = getStyleProfile(styleId);
    state.style = profile.id;

    // Pen physics from profile (angle, tip shape)
    brush.setStyle(profile);

    // Only pen size is exposed in the UI
    const d = profile.defaults || {};
    if (d.weight != null) setPenSize(d.weight);

    // Style hint under the picker
    const styleHint = document.getElementById("styleHint");
    if (styleHint && profile.description) {
      styleHint.textContent =
        state.uiLanguage === "ar"
          ? "اختر نوع الخط الذي تريد التدريب عليه."
          : profile.description;
    }

    // Paper ruling from style (naskh lines, kufic squares, nastaliq hang)
    paper.setGridKind(profile.gridKind || "baseline");
    paper.setPenAngle(profile.penAngleDeg != null ? profile.penAngleDeg : 35);
    // Measures only useful when grid is on in calligraphy
    paper.setShowMeasures(
      state.practice === "calligraphy" && state.surface === "grid"
    );
    if (state.surface === "grid") {
      paper.draw(cssSize());
    }

    if (typeof clearGlyphCache === "function") clearGlyphCache();
    updateGuides();
  }

  // ── guides / letter ───────────────────────────────────
  function setLetter(text) {
    state.current = findLetter(text);
    if (typeInput) typeInput.value = state.current.char;
    charBadge.textContent = state.current.char;
    if (typeof clearGlyphCache === "function") clearGlyphCache();
    updateGuides();
    updatePresetsActive();
    updateHint();
  }

  /** Practice string currently on paper (may include tatweel form). */
  function practiceText() {
    return (state.current?.char || (typeInput && typeInput.value) || "").trim();
  }

  function updateLetterTitle() {
    const arEl = document.getElementById("letterTitleAr");
    const enEl = document.getElementById("letterTitleEn");
    if (!arEl && !enEl) return;
    const entry =
      typeof getAlphabetEntry === "function"
        ? getAlphabetEntry(state.alphabetChar)
        : null;
    if (arEl) arEl.textContent = entry ? entry.nameAr : state.alphabetChar;
    if (enEl) enEl.textContent = entry ? entry.name : "";
  }

  // ── Practice path: Writing vs Calligraphy ─────────────
  function setPractice(practice) {
    state.practice = practice === "calligraphy" ? "calligraphy" : "writing";
    state.hasWatched = false;
    document.body.classList.toggle("is-writing", state.practice === "writing");
    document.body.classList.toggle(
      "is-calligraphy",
      state.practice === "calligraphy"
    );
    // also on .app for CSS we wrote
    const appEl = document.querySelector(".app");
    if (appEl) {
      appEl.classList.toggle("is-writing", state.practice === "writing");
      appEl.classList.toggle("is-calligraphy", state.practice === "calligraphy");
    }

    document.querySelectorAll("[data-practice]").forEach((btn) => {
      const on = btn.dataset.practice === state.practice;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    if (state.practice === "writing") {
      // School handwriting: Naskh only, calm lines, guide on for tracing
      applyStyle("naskh");
      setGhost(true);
      state.showMeasures = false;
      paper.setShowMeasures(false);
      paper.setMode("grid");
      state.surface = "grid";
      document
        .querySelectorAll("[data-surface]")
        .forEach((b) =>
          b.classList.toggle("active", b.dataset.surface === "grid")
        );
      paper.setGridKind("baseline");
      paper.draw(cssSize());
      applyAlphabetForm(state.alphabetChar, state.formId || "chain");
      buildAlphabet();
      buildForms();
      buildPracticeWords();
      updateLetterTitle();
    } else {
      // Calligraphy: styles + keyboard + words (guide stays on by default)
      setGhost(true);
      buildPresets();
      const cur = (typeInput && typeInput.value ? typeInput.value : "").trim();
      const TATWEEL_CH = "\u0640";
      const isFormDrill =
        !cur ||
        cur.includes(TATWEEL_CH) ||
        state.drillKind === "chain" ||
        state.drillKind === "form" ||
        (typeof ALPHABET !== "undefined" &&
          ALPHABET.some((a) => a.char === cur));
      setLetter(isFormDrill ? "الله" : cur);
      brush.clear();
      updateCount();
      applyStyle(state.style || "naskh");
    }

    rebuildStyleButtonsForPractice();
    // Guide stays on when switching modes (user can still turn it off)
    setGhost(true);
    requestAnimationFrame(resize);
  }

  function rebuildStyleButtonsForPractice() {
    if (!styleSeg || typeof STYLE_PROFILES === "undefined") return;
    // Writing has no style picker — always Naskh. Calligraphy shows all families.
    if (state.practice === "writing") {
      styleSeg.innerHTML = "";
      return;
    }
    const order =
      typeof STYLE_ORDER !== "undefined"
        ? STYLE_ORDER
        : Object.keys(STYLE_PROFILES);

    styleSeg.innerHTML = "";
    for (const id of order) {
      const profile = STYLE_PROFILES[id];
      if (!profile) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seg-btn" + (id === state.style ? " active" : "");
      btn.dataset.style = id;
      btn.textContent =
        state.uiLanguage === "ar"
          ? shortArabicLabel(profile)
          : profile.englishName;
      btn.title =
        state.uiLanguage === "ar" ? profile.arabicName : profile.englishName;
      btn.setAttribute(
        "aria-label",
        state.uiLanguage === "ar" ? profile.arabicName : profile.englishName
      );
      btn.addEventListener("click", () => {
        styleSeg
          .querySelectorAll("[data-style]")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyStyle(id);
      });
      styleSeg.appendChild(btn);
    }
  }

  function buildAlphabet() {
    const host =
      document.getElementById("alphabetStrip") ||
      document.getElementById("alphabet");
    if (!host || typeof ALPHABET === "undefined") return;
    host.innerHTML = "";
    for (const entry of ALPHABET) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "alphabet-btn" +
        (entry.char === state.alphabetChar ? " active" : "");
      btn.textContent = entry.char;
      btn.title = state.uiLanguage === "ar" ? entry.nameAr : entry.name;
      btn.addEventListener("click", () => {
        // New letter: Connect first if it joins (workbook pattern), else Alone
        const pack =
          typeof getLetterForms === "function"
            ? getLetterForms(entry.char)
            : { connectsLeft: true };
        const nextForm = pack.connectsLeft ? "chain" : "isolated";
        applyAlphabetForm(entry.char, nextForm);
        buildAlphabet();
        buildForms();
        buildPracticeWords();
        updateLetterTitle();
      });
      host.appendChild(btn);
    }
  }

  /**
   * Apply a letter form, Connect chain, or leave form setup for a word.
   * formId: isolated | initial | medial | final | chain
   */
  /**
   * On phone/tablet, forms & words sit below the paper.
   * After picking one, jump back up so the learner can write right away.
   */
  function scrollPaperIntoView() {
    const target =
      document.getElementById("canvasWrap") ||
      document.querySelector(".canvas-col");
    if (!target) return;
    // Only jump when the paper is not already mostly in view (mobile stack)
    const rect = target.getBoundingClientRect();
    const mostlyVisible =
      rect.top >= 0 && rect.bottom <= (window.innerHeight || 0) + 40;
    if (mostlyVisible) return;
    // Prefer the paper; small offset so title/alphabet don’t cover it
    const top =
      rect.top +
      (window.scrollY || window.pageYOffset || 0) -
      Math.min(72, Math.max(12, window.innerHeight * 0.06));
    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
    // After scroll, canvas size can change (sticky chrome) — remeasure paper
    setTimeout(() => {
      try {
        resize();
      } catch (_) {
        /* ignore */
      }
    }, 320);
  }

  function refreshWritingHint() {
    if (!hint || !hintText) return;
    const entry =
      typeof getAlphabetEntry === "function"
        ? getAlphabetEntry(state.alphabetChar)
        : null;
    if (!entry) return;

    if (state.drillKind === "word" && state.wordPractice) {
      const name =
        state.uiLanguage === "ar" ? entry.nameAr : entry.name;
      hint.hidden = false;
      hintText.textContent =
        state.uiLanguage === "ar"
          ? `${name} · تدرّب على كلمة «${state.wordPractice}». شاهد ترتيب الخطوات ثم تتبع النموذج الفاتح.`
          : `${name} · Practice the word «${state.wordPractice}». Watch the stroke order, then trace the light outline.`;
      return;
    }

    const pack =
      typeof getLetterForms === "function"
        ? getLetterForms(state.alphabetChar)
        : { connectsLeft: true };
    const meta =
      state.formId === "chain"
        ? typeof CHAIN_META !== "undefined"
          ? CHAIN_META
          : null
        : typeof FORM_META !== "undefined"
          ? FORM_META.find((form) => form.id === state.formId)
          : null;
    if (!meta) return;

    const joinNote =
      !pack.connectsLeft && state.formId !== "chain"
        ? state.uiLanguage === "ar"
          ? " لا يتصل هذا الحرف بما بعده، لذلك يشبه الأول والوسط المنفصل."
          : " This letter does not connect to the next one, so Start and Middle look like Alone."
        : "";
    const chainNote =
      state.formId === "chain"
        ? state.uiLanguage === "ar"
          ? " راقب اتصال الحرف من الأول إلى الوسط ثم الأخير."
          : " Watch how the letter joins from start to middle to end."
        : "";
    hint.hidden = false;
    hintText.textContent =
      state.uiLanguage === "ar"
        ? `تدرّب على ${entry.nameAr}. ابدأ بشكل ${meta.labelAr}. شاهد ترتيب الخطوات ثم تتبع النموذج الفاتح.${joinNote}${chainNote}`
        : `Practice ${entry.name}. ${meta.labelEn}: ${meta.hint}. Watch the stroke order, then trace the light outline.${joinNote}${chainNote}`;
  }

  function applyAlphabetForm(char, formId) {
    state.alphabetChar = char;
    state.formId = formId || "isolated";
    state.wordPractice = null;
    state.hasWatched = false;

    const pack =
      typeof getLetterForms === "function"
        ? getLetterForms(char)
        : { forms: { isolated: char }, connectsLeft: true };

    let formStr;
    if (state.formId === "chain") {
      state.drillKind = "chain";
      formStr =
        typeof getChainPractice === "function"
          ? getChainPractice(char)
          : char + char + char;
    } else {
      state.drillKind = "form";
      formStr = pack.forms[state.formId] || pack.forms.isolated || char;
    }

    // Writing practice always uses clear school Naskh (not calligraphy faces)
    if (state.practice === "writing" && state.style !== "naskh") {
      applyStyle("naskh");
    }

    setLetter(formStr);
    // Fresh paper for each form — ready to trace
    brush.clear();
    updateCount();
    setGhost(true);
    updateLetterTitle();

    // Tip for writing mode (set after setLetter so it isn’t overwritten)
    refreshWritingHint();

    // Mobile: jump back to the paper so they can draw immediately
    requestAnimationFrame(scrollPaperIntoView);
  }

  function applyPracticeWord(word) {
    state.drillKind = "word";
    state.wordPractice = word;
    state.formId = null;
    state.hasWatched = false;
    if (state.practice === "writing" && state.style !== "naskh") {
      applyStyle("naskh");
    }
    setLetter(word);
    brush.clear();
    updateCount();
    setGhost(true);
    buildForms();
    buildPracticeWords();

    refreshWritingHint();

    requestAnimationFrame(scrollPaperIntoView);
  }

  function buildForms() {
    const host = document.getElementById("formsGrid");
    const note = document.getElementById("formsNote");
    if (!host || typeof getLetterForms === "undefined") return;

    const pack = getLetterForms(state.alphabetChar);
    const isolated = pack.forms.isolated;
    const chainGlyph =
      typeof getChainPractice === "function"
        ? getChainPractice(state.alphabetChar)
        : state.alphabetChar + state.alphabetChar + state.alphabetChar;

    host.innerHTML = "";
    const metas = typeof FORM_META !== "undefined" ? FORM_META : [];
    for (const meta of metas) {
      const glyph = pack.forms[meta.id] || isolated;
      const sameAsIsolated =
        !pack.connectsLeft &&
        (meta.id === "initial" || meta.id === "medial") &&
        glyph === isolated;

      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "form-card" +
        (meta.id === state.formId && state.drillKind === "form"
          ? " active"
          : "") +
        (sameAsIsolated ? " is-same" : "");
      card.innerHTML = `
        <span class="form-glyph">${glyph}</span>
        <span class="form-meta">
          <span class="form-label-ar">${meta.labelAr}</span>
          <span class="form-label-en">${meta.labelEn}</span>
        </span>
      `;
      card.title = `${meta.labelEn} · ${meta.hint}`;
      card.addEventListener("click", () => {
        applyAlphabetForm(state.alphabetChar, meta.id);
        buildForms();
        buildAlphabet();
        buildPracticeWords();
      });
      host.appendChild(card);
    }

    // Connect card — full width
    const chainMeta =
      typeof CHAIN_META !== "undefined"
        ? CHAIN_META
        : {
            id: "chain",
            labelEn: "Connect",
            labelAr: "وصل",
            hint: "start + middle + end joined",
          };
    const chainCard = document.createElement("button");
    chainCard.type = "button";
    chainCard.className =
      "form-card form-card-chain" +
      (state.formId === "chain" && state.drillKind === "chain" ? " active" : "");
    chainCard.innerHTML = `
      <span class="form-glyph">${chainGlyph}</span>
      <span class="form-meta">
        <span class="form-label-ar">${chainMeta.labelAr}</span>
        <span class="form-label-en">${chainMeta.labelEn}</span>
      </span>
    `;
    chainCard.title = `${chainMeta.labelEn} · ${chainMeta.hint}`;
    chainCard.addEventListener("click", () => {
      applyAlphabetForm(state.alphabetChar, "chain");
      buildForms();
      buildAlphabet();
      buildPracticeWords();
    });
    host.appendChild(chainCard);

    if (note) {
      const entry =
        typeof getAlphabetEntry === "function"
          ? getAlphabetEntry(state.alphabetChar)
          : null;
      const name = entry
        ? `${entry.nameAr} · ${entry.name}`
        : state.alphabetChar;
      note.textContent = pack.connectsLeft
        ? state.uiLanguage === "ar"
          ? "اختر منفصل أو أول أو وسط أو آخر أو وصل لرؤية اتصال الحروف."
          : "Choose a letter form, then watch the stroke order and trace it."
        : state.uiLanguage === "ar"
          ? "هذا الحرف لا يتصل بالحرف الذي بعده. تدرّب على المنفصل أو الأخير."
          : "This letter does not join to the next letter. Practice Alone or End.";
      // Keep name visible in letter title; note stays instructional
      if (entry) {
        note.setAttribute("data-letter", name);
      }
    }
  }

  function buildPracticeWords() {
    const host = document.getElementById("practiceWords");
    if (!host) return;
    const words =
      typeof getPracticeWords === "function"
        ? getPracticeWords(state.alphabetChar)
        : [];
    host.innerHTML = "";
    if (!words.length) {
      const empty = document.createElement("span");
      empty.className = "forms-note";
      empty.textContent = "No sample words yet.";
      host.appendChild(empty);
      return;
    }
    for (const word of words) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "practice-word-btn" +
        (state.drillKind === "word" && state.wordPractice === word
          ? " active"
          : "");
      btn.textContent = word;
      btn.dir = "rtl";
      btn.lang = "ar";
      btn.title = `Practice word: ${word}`;
      btn.addEventListener("click", () => {
        applyPracticeWord(word);
      });
      host.appendChild(btn);
    }
  }

  document.querySelectorAll("[data-practice]").forEach((btn) => {
    btn.addEventListener("click", () => setPractice(btn.dataset.practice));
  });

  /** Guide options including user text size (for multi-word fit). */
  function activeGuide() {
    const profile = getStyleProfile(state.style);
    const g = { ...(profile.guide || {}) };
    g.userScale = state.textSize != null ? state.textSize : 1;
    return { profile, guide: g };
  }

  function updateGuides() {
    // Ghost uses the SAME bitmap as Show me (shared cache) — no double-draw offset
    // Hide while Show me is running so you never see two copies at once
    const visible =
      !state.teaching && (state.mode === "trace" || state.ghost);
    const ch = state.current?.char || "";
    const { profile, guide: g } = activeGuide();
    const size = Math.round(cssSize() || 400);

    // Badge: short label for long phrases
    if (charBadge) {
      const short =
        ch.length > 18 ? [...ch].slice(0, 14).join("") + "…" : ch;
      charBadge.textContent = short;
      charBadge.title = ch;
    }

    if (!ghostCanvas) return;
    const gctx = ghostCanvas.getContext("2d");
    const dpr = ghostCanvas.width / (cssSize() || size) || 1;
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.clearRect(0, 0, size + 2, size + 2);

    if (visible && ch && typeof getSharedGlyphLayer === "function") {
      const shared = getSharedGlyphLayer(ch, size, g, profile.id, dpr);
      if (shared?.layer) {
        // Writing: slightly stronger ghost so tracing is easy (workbook feel)
        const base =
          g.opacity != null
            ? g.opacity
            : state.practice === "writing"
              ? 0.18
              : 0.12;
        const op =
          state.mode === "trace"
            ? Math.min(0.28, base + 0.08)
            : state.practice === "writing"
              ? Math.min(0.26, base)
              : base;
        gctx.globalAlpha = op;
        // Draw the identical layer Show me uses
        gctx.drawImage(shared.layer, 0, 0, size, size);
        gctx.globalAlpha = 1;
      }
    }

    if (strokeNumbers) strokeNumbers.innerHTML = "";
  }

  function updateHint() {
    if (state.practice === "writing") return; // writing sets its own tips
    if (state.current?.tip) {
      hint.hidden = false;
      hintText.textContent = state.current.tip + " · ";
    } else {
      hint.hidden = true;
    }
  }

  function updateCount() {
    strokeCountEl.textContent = String(brush.strokeCount());
  }

  function updatePresetsActive() {
    if (!presetsEl) return;
    presetsEl.querySelectorAll(".preset").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.char === state.current?.char);
    });
  }

  function buildPresets() {
    if (!presetsEl) return;
    presetsEl.innerHTML = "";
    for (const ch of PRESETS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset";
      btn.dataset.char = ch;
      btn.textContent = ch;
      btn.title = findLetter(ch).meaning;
      btn.addEventListener("click", () => {
        setLetter(ch);
        brush.clear();
        updateCount();
        setGhost(true);
      });
      presetsEl.appendChild(btn);
    }
  }

  /** Calligraphy: put a random real Arabic word on the paper to practice. */
  function applyRandomWord() {
    const avoid = (state.current?.char || typeInput?.value || "").trim();
    const word =
      typeof randomPracticeWord === "function"
        ? randomPracticeWord(avoid)
        : "سلام";
    if (typeInput) typeInput.value = word;
    state.hasWatched = false;
    setLetter(word);
    brush.clear();
    updateCount();
    setGhost(true);
    if (hint && hintText) {
      hint.hidden = false;
      hintText.textContent = t("randomHint", { word });
    }
  }

  const randomWordBtn = document.getElementById("randomWordBtn");
  if (randomWordBtn) {
    randomWordBtn.addEventListener("click", applyRandomWord);
  }

  function syncFromInput(commit) {
    if (!typeInput) return;
    const v = typeInput.value;
    const trimmed = v.trim();
    if (!trimmed) {
      charBadge.textContent = "";
      if (typeof clearGlyphCache === "function") clearGlyphCache();
      updateGuides();
      return;
    }
    state.current = findLetter(trimmed);
    charBadge.textContent = state.current.char;
    // Typing updates the guide on the paper right away
    if (typeof clearGlyphCache === "function") clearGlyphCache();
    if (!state.ghost) setGhost(true);
    else updateGuides();
    updatePresetsActive();
    updateHint();
    if (commit) {
      state.hasWatched = false;
      brush.clear();
      updateCount();
      setLetter(trimmed);
    }
  }

  if (typeInput) {
    typeInput.addEventListener("input", () => syncFromInput(false));

    typeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        syncFromInput(true);
      }
    });
  }

  // ── On-screen Arabic keyboard (calligraphy only UI; mount always) ──
  if (kbHost && typeof mountArabicKeyboard === "function" && typeInput) {
    keyboardController = mountArabicKeyboard(kbHost, {
      getValue: () => typeInput.value,
      getLanguage: () => state.uiLanguage,
      setValue: (t) => {
        typeInput.value = t;
      },
      onChange: () => syncFromInput(false),
      onCommit: (t) => {
        typeInput.value = t;
        syncFromInput(true);
      },
    });
  }

  if (kbToggle && kbDock) {
    kbToggle.addEventListener("click", () => {
      state.kbOpen = !state.kbOpen;
      kbDock.classList.toggle("is-collapsed", !state.kbOpen);
      kbToggle.setAttribute("aria-expanded", state.kbOpen ? "true" : "false");
      kbToggle.textContent = t(state.kbOpen ? "hideKeyboard" : "showKeyboard");
      // When keyboard rail is collapsed, give the paper more room
      document.documentElement.style.setProperty(
        "--kb-w",
        state.kbOpen ? "" : "100px"
      );
    });
  }

  // ── Show me: clean real letter under a moving pen tip ──
  async function showMeStroke() {
    const size = cssSize();
    const text = (
      state.current?.char ||
      (typeInput && typeInput.value) ||
      ""
    ).trim();
    if (!text) return;

    const { profile, guide: g } = activeGuide();
    const family = g.fontFamily || '"Noto Naskh Arabic", serif';
    const weight = g.fontWeight || "500";

    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
        await document.fonts.load(
          `${weight} ${Math.round(size * 0.5)}px ${family}`
        );
      } catch (_) {
        /* fallback font is fine */
      }
    }

    brush.clear();
    updateCount();

    const paperPx = Math.round(size);

    if (typeof animateShowMeGlyph === "function") {
      await animateShowMeGlyph(
        inkCanvas,
        text,
        paperPx,
        state.playSpeed || 1,
        g,
        profile.id
      );
    }

    if (strokeCountEl) strokeCountEl.textContent = "1";
  }

  // ── surface (plain / lines) ───────────────────────────
  bindSeg("surface", "surface", () => {
    paper.setMode(state.surface);
    paper.setShowMeasures(
      state.practice === "calligraphy" && state.surface === "grid"
    );
    paper.draw(cssSize());
  });

  // ── init ──────────────────────────────────────────────
  bindSliders();
  buildStyleButtons();
  buildPresets();
  // Default path: Writing (alphabet) — most learners need this first
  setPractice("writing");
  setGhost(true); // guide on by default in every mode
  document.querySelectorAll("[data-ui-language-choice]").forEach((btn) => {
    btn.addEventListener("click", () => setUiLanguage(btn.dataset.uiLanguageChoice));
  });
  setUiLanguage(state.uiLanguage);
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => {
    setTimeout(resize, 120);
  });
  // iOS visual viewport changes (URL bar show/hide)
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      clearTimeout(window.__inkVvTimer);
      window.__inkVvTimer = setTimeout(resize, 80);
    });
  }

  charBadge.style.opacity = "1";
})();
