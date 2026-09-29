# Lumi — project rules

Lumi is a single-screen, offline, installable calculator (PWA) whose selling point is its look:
premium "satin pearl" keys, a crisp HD display, and 6 themes (Classic Mono — the default —
Lavender Haze, Strawberry Milk, Matcha Latte, Blueberry Butter, Melody), each with light and dark
modes, themed stickers, fairy lights, falling petals and per-theme key sounds (Melody plays notes).
Vanilla HTML/CSS/JS built with Vite; deployed on Vercel from `main`.

**Restore point:** the tag `v1-simple` (branch `simple-version`) is the first, simple version the
user loved. If they ask to "restore the simple version", redeploy that code.

## Commands
- `npm run dev` — local dev server
- `npm test` — engine + palette contrast tests (Vitest)
- `npm run build` / `npm run preview` — production build (with service worker) and preview
- `npm run icons` — regenerate PWA icons from `scripts/icon-art.mjs`

## Layout
- `src/engine/` — pure calculator logic (`evaluate.js` parser, `calculator.js` input state machine, `format.js` Indian grouping)
- `src/ui/` — DOM code (display, keypad, theme, history, scientific panel, effects, scenery, sound)
- `src/ui/sticker-art.js` — all sticker/petal artwork as pure SVG strings (unit-tested)
- `src/styles/tokens.css` — all colors, one block per theme × mode

## Rules

**Battery and performance**
1. Zero work when idle: no `setInterval`, no `requestAnimationFrame` loops, no polling. Ambient animations carry `.amb` and pause after 30 s without a tap; the audio engine suspends after 30 s of silence.
2. Animate only `transform`/`opacity` (the theme reveal's clip-path is the one exception). Interaction feedback ≤ 250 ms; one-off flourishes ≤ 1.5 s. Respect `prefers-reduced-motion` (no ambient motion at all).
3. No `backdrop-filter`, animated gradients, canvas, video, or large images.
4. No network after first load: no CDNs, analytics, or external fonts. Everything is precached.
5. Keep the app under 200 KB total (the Shantell Sans font is ~105 KB of it). One delegated listener for the keypad. Write to localStorage only when history or settings change.

**Design**
6. Every color comes from a token in `tokens.css` — never a hard-coded hex in component CSS.
7. Check every change in all 12 theme × mode combinations. Text must meet WCAG AA 4.5:1 (`tests/contrast.test.js` enforces it).
8. Icons and the logo are inline SVG using `currentColor`/tokens so they stay sharp and recolor with the theme.
9. Mobile essentials: `100dvh`, safe-area insets, `touch-action: manipulation`, no tap highlight or text selection on keys, keys ≥ 56 px tall in portrait on normal phones.
10. Decorative but never messy: the user loves the clean base. Decorations (stickers, garland, petals) stay out of the numbers' way and step aside when the display is short. Add only what's needed.

**Code**
11. Never use `eval()` or `Function()`. The engine is pure functions and fully unit-tested.
12. `src/engine` never touches the DOM; UI code never does math.
13. Plain, readable code in small modules. No framework.

**Git and deploy**
14. Commit in logical steps with clear messages. Never commit `node_modules`, `dist`, or `.vercel`.
15. `main` is always deployable — pushing to `main` redeploys production on Vercel.
