import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Checks every palette in tokens.css against WCAG AA (4.5:1) for all text.
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

const palettes = {};
for (const [, theme, mode, body] of css.matchAll(/\[data-theme="(\w+)"\]\[data-mode="(\w+)"\]\s*\{([^}]*)\}/g)) {
  palettes[`${theme}/${mode}`] = Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [text token, background tokens it sits on]
const PAIRS = [
  ['text', ['screen-top', 'screen-bottom', 'panel']],
  ['muted', ['screen-top', 'screen-bottom', 'panel']],
  ['key-text', ['key-top', 'key-bottom']],
  ['fn-text', ['fn-top', 'fn-bottom']],
  ['op-text', ['op-top', 'op-bottom']],
  ['eq-text', ['eq-top', 'eq-bottom']],
  ['sci-text', ['sci-top', 'sci-bottom']],
];

describe('palettes', () => {
  it('defines all 5 themes in light and dark', () => {
    for (const theme of ['mono', 'lavender', 'strawberry', 'matcha', 'blueberry']) {
      expect(palettes[`${theme}/light`], `${theme}/light`).toBeDefined();
      expect(palettes[`${theme}/dark`], `${theme}/dark`).toBeDefined();
    }
  });

  it('gives every palette the same set of tokens', () => {
    const names = Object.keys(palettes['mono/light']).sort();
    for (const [key, p] of Object.entries(palettes)) expect(Object.keys(p).sort(), key).toEqual(names);
  });

  for (const [key, p] of Object.entries(palettes)) {
    it(`${key}: all text meets WCAG AA`, () => {
      for (const [fg, bgs] of PAIRS) {
        for (const bg of bgs) {
          const ratio = contrast(p[fg], p[bg]);
          expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});
