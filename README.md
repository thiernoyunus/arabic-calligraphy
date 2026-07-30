# حبر · Ink

**Practice Arabic writing and calligraphy in the browser.**

Two paths, one paper:

| | **Writing · كتابة** | **Calligraphy · خط** |
|--|---------------------|----------------------|
| **Who** | Learning the alphabet | Practicing pen styles |
| **What** | Letter forms (alone / start / middle / end), connect drills, practice words | Naskh, Ruqʿah, Thuluth, Kufic, Nastaʿliq, and more |
| **How** | Clear school **Naskh**, ghost to trace, Show me | Style-aware pen feel, keyboard, free composition |

Built for **phone, iPad (Safari + Apple Pencil), and desktop** — no install required.

---

## Try it

```bash
# Clone, then open in any modern browser
cd arabic-calligraphy
python3 -m http.server 8765
# → http://localhost:8765
```

Or open `index.html` directly (some browsers restrict fonts without a local server).

**iPad / iPhone:** open the URL in Safari → Share → **Add to Home Screen** for a full-screen practice app.

---

## Features

### Writing mode
- Full Arabic alphabet picker  
- **Alone · Start · Middle · End** forms for each letter  
- **Connect** drill (e.g. ببب) so you see start → middle → end joined  
- Practice words per letter  
- Ghost outline + **Show me** (shape, right → left)  
- Pen, **eraser** (scrub one area), undo, clear all  

### Calligraphy mode
- Real script families with matching web fonts (Naskh, Ruqʿah, Kufic, Nastaʿliq, …)  
- On-screen Arabic keyboard + quick words  
- Pen size and plain / lined paper  
- Same draw / erase / undo tools  

### Paper tools (always under the canvas)
- **Pen** · **Eraser** · **Undo** · **Clear all** · **Show me** · **Ghost**

---

## Stack

Plain **HTML, CSS, and JavaScript**. No build step, no framework, no npm install.

| File | Role |
|------|------|
| `index.html` | App shell |
| `styles.css` | Layout + responsive UI |
| `app.js` | Modes, forms, UI wiring |
| `brush.js` | Reed-pen drawing engine |
| `glyph.js` | Ghost outline + Show me animation |
| `forms.js` | Alphabet, four forms, connect, practice words |
| `styles.js` | Calligraphy style profiles |
| `letters.js` | Letter tips / presets |
| `keyboard.js` | On-screen Arabic keyboard |
| `manifest.webmanifest` | Add to Home Screen |
| `docs/` | Product notes & research guides |

---

## Scripts (calligraphy)

| Style | Arabic | Notes |
|--------|--------|--------|
| **Naskh** | النسخ | Clear book hand — also used for Writing mode |
| **Ruqʿah** | الرقعة | Everyday handwriting |
| **Thuluth** | الثلث | Ceremonial curves (study model on screen) |
| **Muhaqqaq** | المحقَّق | Majestic classical hand |
| **Kufic** | الكوفي | Angular / geometric |
| **Diwani** | الديواني | Ottoman court style |
| **Maghrebi** | المغربي | Western Islamic family |
| **Nastaʿliq** | النستعليق | Persian hanging script |

Screen fonts approximate each family; true classical work still needs a reed pen and a teacher.

---

## Deploy

This is a static site. Drop the folder on any host:

- **GitHub Pages** — enable Pages from the repo root (or `/docs` if you prefer)  
- **Netlify / Cloudflare Pages / Vercel** — point at the repo, no build command  
- Any static file server  

No environment variables. No backend.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Docs

- [Product model](docs/product.md) — Writing vs Calligraphy  
- [Writing research notes](docs/writing-guide.md)  
- [Calligraphy research notes](docs/calligraphy-guide.md)  
- [Roadmap ideas](docs/roadmap.md)  
