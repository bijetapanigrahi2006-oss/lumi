# ✦ Lumi

A premium, pastel calculator that installs on your phone and works completely offline.

- **6 themes, each in light and dark:** Classic Mono (default), Lavender Haze, Strawberry Milk, Matcha Latte, Blueberry Butter, and **Melody**, where every key plays a musical note. Each theme has its own stickers, fairy lights, falling petals, background pattern and key sounds.
- **Satin pearl keys:** rounded, softly lit keys that sink gently when pressed.
- **A crisp HD display** with a live preview, Indian number grouping (12,34,567) and auto-fitting digits.
- **Everything a normal calculator does:** + − × ÷, %, ±, backspace, repeat "=", plus scientific functions (√, x², xʸ, π, e, sin/cos/tan, ln, log, x!, 1/x, DEG/RAD) and calculation history.
- **Effects:** themed particles on each tap, sticker confetti and bouncing digits on results, stickers that wobble when tapped, and a circular reveal when you switch themes. Ambient motion pauses after 30 s idle and respects "reduce motion". Sound can be muted with the speaker button.
- **Easy on the battery:** no framework, about 130 KB including fonts, zero work while idle, and no network use after the first visit. The dark modes use near-black backgrounds for OLED screens.

## Install on your phone
1. Open the app link in your browser.
2. **Android (Chrome):** tap ⋮ → **Install app**. **iPhone (Safari):** tap Share → **Add to Home Screen**.
3. That's it. Lumi now opens from your home screen, even in airplane mode.

## Develop
```bash
npm install
npm run dev       # local dev server
npm test          # engine + color-contrast tests
npm run build     # production build with offline service worker
npm run icons     # regenerate app icons
```

Built with vanilla JavaScript, CSS and [Vite](https://vite.dev). Deployed on Vercel. The font is [Shantell Sans](https://fonts.google.com/specimen/Shantell+Sans) (SIL Open Font License), bundled for offline use.
