# Lumi — project rules

Lumi is a single-screen, offline, installable calculator (PWA) whose selling point is its look:
premium "satin pearl" keys, a crisp HD display, and 5 themes (Classic Mono — the default —
Lavender Haze, Strawberry Milk, Matcha Latte, Blueberry Butter), each with light and dark modes.
Vanilla HTML/CSS/JS built with Vite; deployed on Vercel from `main`.

## Commands
- `npm run dev` — local dev server
- `npm test` — engine + palette contrast tests (Vitest)
- `npm run build` / `npm run preview` — production build (with service worker) and preview
- `npm run icons` — regenerate PWA icons from `scripts/icon-art.mjs`

## Layout
- `src/engine/` — pure calculator logic (`evaluate.js` parser, `calculator.js` input state machine, `format.js` Indian grouping)
- `src/ui/` — DOM code (display, keypad, theme, history, scientific panel, effects)
- `src/styles/tokens.css` — all colors, one block per theme × mode

## Rules

**Battery and performance**
1. Zero work when idle: no `setInterval`, no endless `requestAnimationFrame` loops, no polling.
2. Animate only in response to the user, only `transform`/`opacity` (the theme reveal's clip-path is the one exception). Interaction feedback ≤ 250 ms; one-off flourishes (result sparkle, theme reveal) ≤ 900 ms. Respect `prefers-reduced-motion`.
3. No `backdrop-filter`, animated gradients, canvas, video, or large images.
4. No network after first load: no CDNs, analytics, or external fonts. Everything is precached.
5. Keep the app under 100 KB gzipped. One delegated listener for the keypad. Write to localStorage only when history or settings change.

**Design**
6. Every color comes from a token in `tokens.css` — never a hard-coded hex in component CSS.
7. Check every change in all 10 theme × mode combinations. Text must meet WCAG AA 4.5:1 (`tests/contrast.test.js` enforces it).
8. Icons and the logo are inline SVG using `currentColor`/tokens so they stay sharp and recolor with the theme.
9. Mobile essentials: `100dvh`, safe-area insets, `touch-action: manipulation`, no tap highlight or text selection on keys, keys ≥ 56 px tall in portrait on normal phones.
10. Premium and calm: soft shadows, generous spacing, one accent per theme. Effects are subtle, clean, and never noisy.

**Code**
11. Never use `eval()` or `Function()`. The engine is pure functions and fully unit-tested.
12. `src/engine` never touches the DOM; UI code never does math.
13. Plain, readable code in small modules. No framework.

**Git and deploy**
14. Commit in logical steps with clear messages. Never commit `node_modules`, `dist`, or `.vercel`.
15. `main` is always deployable — pushing to `main` redeploys production on Vercel.
