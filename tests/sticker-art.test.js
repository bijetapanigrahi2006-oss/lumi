import { describe, it, expect } from 'vitest';
import { ART, SETS, FALLING, PARTICLES, THEMES, stickerSVG, artSVG, particleSVG } from '../src/ui/sticker-art.js';

describe('sticker art', () => {
  it('gives every theme a full sticker set, falling items and particles', () => {
    for (const t of THEMES) {
      expect(SETS[t].length, t).toBeGreaterThanOrEqual(8);
      expect(FALLING[t].length, t).toBeGreaterThanOrEqual(4);
      expect(PARTICLES[t].length, t).toBeGreaterThanOrEqual(3);
    }
  });

  it('only references artwork that exists, and renders valid-looking SVG', () => {
    for (const t of THEMES) {
      for (const [name, ...args] of [...SETS[t], ...FALLING[t]]) {
        expect(ART[name], name).toBeTypeOf('function');
        const svg = stickerSVG(name, ...args);
        expect(svg).toMatch(/^<svg class="stk"[^>]*><g class="back">.*<\/g><g class="art">.*<\/g><\/svg>$/s);
        expect(svg).not.toMatch(/NaN|undefined/);
        expect(artSVG(name, ...args)).not.toMatch(/NaN|undefined/);
      }
      for (const [name, color] of PARTICLES[t]) expect(particleSVG(name, color)).not.toMatch(/NaN|undefined/);
    }
  });
});
