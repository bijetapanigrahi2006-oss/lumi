# ✦ Lumi

A premium, pastel calculator that installs on your phone and works completely offline.

- **5 themes, each in light and dark:** Classic Mono (default), Lavender Haze, Strawberry Milk, Matcha Latte, Blueberry Butter. The logo, browser-tab icon and status bar recolor with the theme.
- **Satin pearl keys:** rounded, softly lit keys that sink gently when pressed.
- **A crisp HD display** with a live preview, Indian number grouping (12,34,567) and auto-fitting digits.
- **Everything a normal calculator does:** + − × ÷, %, ±, backspace, repeat "=", plus scientific functions (√, x², xʸ, π, e, sin/cos/tan, ln, log, x!, 1/x, DEG/RAD) and calculation history.
- **Subtle effects:** light blooms on each tap, a pearl sheen and sparkles on results, and a circular reveal when you switch themes. They all respect "reduce motion".
- **Easy on the battery:** no framework, about 48 KB gzipped, zero work while idle, and no network use after the first visit. The dark modes use near-black backgrounds for OLED screens.

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

Built with vanilla JavaScript, CSS and [Vite](https://vite.dev). Deployed on Vercel. The font is [Outfit](https://fonts.google.com/specimen/Outfit) (SIL Open Font License), bundled for offline use.
