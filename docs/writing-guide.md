# How Arabic Writing Works  
A practical research guide for **حبر · Ink** (and for learning)

This is **not** Chinese stroke-order with numbered boxes. Arabic is a **connected, right-to-left script**. Teaching and “Show me” should respect that.

**Also read:** `ARABIC_CALLIGRAPHY_GUIDE.md` — reed pen, styles (Naskh/Thuluth…), proportions, training craft.

---

## 1. Big picture (the rules that never change)

### 1.1 Direction
- Write and read **right → left**.
- The pen usually moves along a **baseline** (the main writing line).
- In our app the grid baseline sits at **62%** down the paper (mashq-style ruling).

### 1.2 One sound, many shapes
Arabic has **28 letters**. Almost every letter has **up to four shapes**, depending on where it sits in a word:

| Position | Meaning | Example idea |
|----------|---------|----------------|
| **Isolated** | Alone | ب |
| **Initial** | Start of a connected run | بـ |
| **Medial** | Middle, joined both sides | ـبـ |
| **Final** | End of a connected run | ـب |

So “how do I start this letter?” often means: **which form am I writing?**  
Isolated ب is not drawn exactly like medial ـبـ.

### 1.3 Letters that **do not** connect to the left
These six **always break** the word after them (you lift and start a new “chunk”):

**ا د ذ ر ز و**  
(and related: أ إ آ ؤ etc. behave like non-joiners)

After these, the next letter starts **fresh** (often as an initial/isolated shape).

### 1.4 Dots (**nuqaṭ / nuqta**) come **after** the body
- First draw the **skeleton** (the body of the letter).
- Then place **dots** above or below.
- Dots are what make ب ت ث ن ي… different from each other when the body looks similar.

**Typical teaching order:** body → dots (not dots first).

### 1.5 Short vowels are usually **not** part of the letter stroke
- Marks like َ ُ ِ ّ ْ are **extra** (tashkīl).
- Beginners and most books omit them.
- If you add them, they come **after** the word/letter body.

### 1.6 The pen (qalam) — classical vs our app
- Classical calligraphy uses a **cut reed pen** (angled nib). Thickness comes from the cut and the angle.
- Everyday handwriting (ruqʿah / school naskh) is often closer to a **simple pen**.
- For **Show me**, a **clean, even dark stroke of the real letter** is clearer for learners than fake calligraphy scribbles.
- Free-drawing can still use a brush/qalam feel.

---

## 2. Classical proportion (why naskh looks “balanced”)

Attributed largely to **Ibn Muqla** (10th c.) and refined by later masters:

| Unit | Role |
|------|------|
| **Nuqṭa (dot)** | Size of the diamond made by the pen tip — the measuring unit |
| **Alif** | Tall vertical; often **5–7 dots** high in naskh |
| **Circle** | Diameter ≈ alif height; many bowls/curves fit this geometry |

**Practical meaning for our grid:**
- Strong **baseline**
- Guide for **alif height** above the line
- Room **below** the line for deep bowls (ق ي ن …)

Our paper grid (baseline / mid / descender) is there to support this — letters should **sit on the baseline**, not float in the center.

---

## 3. How you actually move the pen (general method)

Think in this loop for almost every letter:

```
1. Put pen down at the START of the body (usually on/near the right of that letter’s shape).
2. Draw the body in one (or few) continuous motion(s), staying aware of the baseline.
3. Lift.
4. Add dots / hamza / marks if needed.
5. Move left to the next letter (or start a new chunk after a non-joiner).
```

### 3.1 Where does a letter “start”?
There is **no single universal pixel** for every style, but school/naskh teaching is consistent enough:

| Family | Body idea | Typical start |
|--------|-----------|----------------|
| **Alif group** ا | One vertical downstroke | Top of the vertical → down to baseline |
| **Bāʾ family** ب ت ث ن ي | Open bowl on the line | Right end of bowl → left (then dots) |
| **Jīm family** ج ح خ | Upper head + lower bowl | Upper right of the head curve, then down into the body |
| **Sīn family** س ش | Teeth + ending | Rightmost tooth → left through teeth → finish |
| **Ṣād family** ص ض | Closed loop + ending | Right of the loop, around, then left finish |
| **Ṭāʾ family** ط ظ | Loop + tall stem | Often body/loop first, then the upright (teaching varies slightly) |
| **ʿAyn family** ع غ | Open “eye” + lower curve | Upper stroke, then lower bowl |
| **Fāʾ / Qāf** ف ق | Loop + tail; qāf deeper | Loop body first, **then** dot(s) |
| **Kāf** ك | Vertical + small mark / arms | Vertical or main arm first (form-dependent) |
| **Lām** ل | Tall down + foot | Top → down → small terminal |
| **Mīm** م | Head loop + tail | Head first, then descending tail |
| **Hāʾ** ه | Closed rounded form | Around the loop (one motion when possible) |
| **Wāw** و | Head + descending curve | Small head, then tail down/left |
| **Yāʾ** ي | Returning bowl + two dots below | Bowl first, then two dots |

### 3.2 Connected writing (the real skill)
When letters join, you often **do not lift** between them:

- The **end** of letter A becomes the **start** of letter B’s body.
- Example **حب**: write ḥāʾ body → continue into bāʾ bowl → **then** bāʾ’s one dot below.
- Example **سلام**: sīn teeth → lām → alif (non-joiner after lām? wait: س ل ا م — after alif the connection breaks; mīm starts new)  
  Actually: سـلـا م — lām connects to alif? **Alif does not accept a join from the right into a left connector the same way** — alif is a non-joiner to its left.  
  Sequence: sīn (initial) → lām (medial) → **alif breaks** → mīm (isolated/final-ish after break).

**Rule of thumb for demos:**  
Prefer **pen-down runs between joiners**, and **pen-up** after non-joiners and before dots.

---

## 4. Letter-by-letter cheat sheet (isolated / teaching form)

Use this as product truth for “where to start.”  
*(Everyday school naskh / clear handwriting — not every regional calligraphy variant.)*

### Group A — non-joiners (simple)
| Letter | Name | How you write it | Dots |
|--------|------|------------------|------|
| ا | alif | Top → straight down to baseline | — |
| د | dāl | Short right-facing hook / angle on the line | — |
| ذ | dhāl | Same as dāl | 1 above |
| ر | rāʾ | Curve sitting on/near baseline, flowing left-down | — |
| ز | zāy | Same as rāʾ | 1 above |
| و | wāw | Small head loop, then tail down-left | — |

### Group B — bāʾ family (same body, different dots)
| Letter | Body | Dots (after body) |
|--------|------|-------------------|
| ب bāʾ | Open bowl | 1 **below** |
| ت tāʾ | Same bowl | 2 **above** |
| ث thāʾ | Same bowl | 3 **above** |
| ن nūn | Similar open bowl (often a bit different finish) | 1 **above** |
| ي yāʾ | Returning bowl | 2 **below** |

**Start:** right side of the bowl, move left, close/finish, **then** dots.

### Group C — jīm family
| Letter | Body | Dots |
|--------|------|------|
| ج jīm | Upper curve + deep lower body | 1 **inside** |
| ح ḥāʾ | Same skeleton | none |
| خ khāʾ | Same skeleton | 1 **above** |

**Start:** upper part of the letter (right/top of the head), flow into the lower body.  
Dot for jīm/khāʾ after the body.

### Group D — sīn / shīn
| Letter | Body | Dots |
|--------|------|------|
| س sīn | Three “teeth” → finishing stroke | none |
| ش shīn | Same | 3 **above** |

**Start:** rightmost tooth, left through the teeth, then the final curve.

### Group E — ṣād / ḍād
| Letter | Body | Dots |
|--------|------|------|
| ص ṣād | Closed oval/loop + finish | none |
| ض ḍād | Same | 1 **above** |

**Start:** form the closed head, then the trailing finish; then dot for ḍād.

### Group F — ṭāʾ / ẓāʾ
| Letter | Notes |
|--------|--------|
| ط ṭāʾ | Flat/oval base + tall stem |
| ظ ẓāʾ | Same + 1 dot above |

Teaching often: **base first**, then **upright** (some teachers reverse for speed — pick one and stay consistent in the app).

### Group G — ʿayn / ghayn
| Letter | Body | Dots |
|--------|------|------|
| ع ʿayn | Upper open stroke + lower bowl | none |
| غ ghayn | Same | 1 **above** |

**Start:** upper element, then the lower curve. Deep space below the line is normal.

### Group H — fāʾ / qāf
| Letter | Body | Dots |
|--------|------|------|
| ف fāʾ | Loop on the line + short finish | 1 **above** |
| ق qāf | Deeper bowl (more below the line) | 2 **above** |

**Start:** loop/body first, **then** dots.  
(Your **حق** diagram: ḥāʾ strokes → qāf body → two dots — that matches this logic.)

### Group I — kāf, lām, mīm, hāʾ
| Letter | Motion |
|--------|--------|
| ك kāf | Main vertical/arm structure; small “hamza-like” mark on some forms after/with body |
| ل lām | From the top down to the baseline foot |
| م mīm | Head (small loop) first, then descending tail |
| ه hāʾ | One rounded closed motion when isolated; medial forms differ a lot |

---

## 5. Worked examples (words in our app)

### 5.1 حق (ḥaqq — “truth”)
Connected **ḥāʾ → qāf**, then dots.

Suggested demo / teaching order (matches your numbering idea):

1. **ḥāʾ** upper curve (start upper-right of the ḥāʾ)  
2. **ḥāʾ** lower body into the join  
3. **qāf** deep body (room below the baseline)  
4. **Two dots** above qāf  

Do **not** put dots first.

### 5.2 حب (ḥubb — “love”)
1. **ḥāʾ** body  
2. **bāʾ** bowl continuing left  
3. **One dot** under bāʾ  

### 5.3 سلام (salām — “peace”)
1. **sīn** teeth + finish (right → left)  
2. **lām** tall down  
3. **alif** (non-joiner — separate vertical)  
4. **mīm** head + tail  

### 5.4 الله
Sacred form — extra care with proportions and dignity.

Typical structure people practice:
1. Alif  
2–3. Lām(s)  
4. Hāʾ  

(Exact calligraphic construction is style-specific; for learning, keep proportions balanced and avoid rushing.)

---

## 6. What this means for **حبر · Ink** (product decisions)

### Do this
| Feature | How Arabic truth applies |
|---------|---------------------------|
| **Direction** | Demos and motion should prefer **right → left** |
| **Baseline** | Ghost, grid, and Show me share the **same baseline** |
| **Show me** | Show the **correct word shape** clearly; motion can follow RTL coverage of that shape |
| **Trace** | Ghost = target shape to copy; not Chinese numbered boxes |
| **Dots** | If we ever animate true stroke order, **body before dots** |
| **Non-joiners** | After ا د ذ ر ز و, treat a **pen lift** / new run as correct |
| **Styles** | Naskh = readability; Thuluth = taller/ceremonial; Ruqʿah = faster/simpler — same alphabet, different rhythm |

### Don’t do this
- Don’t invent Chinese-style stroke numbers floating off the letter.  
- Don’t animate random zigzags and call it calligraphy.  
- Don’t put dots before the body.  
- Don’t center the letter mid-page when the grid has a baseline.  
- Don’t assume one path works for isolated **and** medial forms without checking.

### Honest split (for a solid product)
| Goal | Best approach |
|------|----------------|
| “What should this word **look** like?” | Clean glyph Show me (what we improved) |
| “In what **order** do I move the pen?” | Per-letter / per-word stroke guides (hand-authored, body→dots) — harder, high value later |
| “How does my freehand feel?” | Brush / pen weight on the canvas |

These are **related** but not the same feature. Mixing them poorly is what made earlier demos feel broken.

---

## 7. Research sources (for going deeper)

- Arabic alphabet structure, RTL, positional forms: [arabic-course.com alphabet lesson](http://www.arabic-course.com/arabic-alphabet.html)
- Six pens / classical styles overview: Middle East Eye calligraphy styles guide  
- Ibn Muqla proportion system (nuqṭa, alif, circle): encyclopedia / calligraphy history summaries; geometric proportion literature on *al-khaṭṭ al-mansūb*
- Nuqṭa as unit of measure: classical calligraphy pedagogy (Ibn Muqla → Ibn al-Bawwāb → later schools)

---

## 8. One-page summary

1. **Right → left**, mostly on a **baseline**.  
2. Letters **change shape** by position; six letters **don’t join left**.  
3. Draw **body first**, **dots second**.  
4. Connected words are **runs of pen**, not 28 isolated drawings glued together.  
5. Classical beauty is **measured** (dot / alif / circle), which is why grids matter.  
6. For the app: **correct shape + baseline + RTL motion** first; **true stroke-order paths** second, letter by letter, with body→dots discipline.

---

*Living doc for the Ink project. When we add true stroke demos, update section 5 with verified paths per word.*
