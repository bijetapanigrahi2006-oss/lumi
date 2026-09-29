// Generates the PWA icons into public/. Run with: npm run icons
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { iconSVG } from './icon-art.mjs';

const rounded = Buffer.from(iconSVG({ rounded: true }));
const fullBleed = Buffer.from(iconSVG({ rounded: false }));
const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));

writeFileSync(out('logo.svg'), rounded);
await sharp(rounded, { density: 300 }).resize(192, 192).png({ palette: true, quality: 92, effort: 10, dither: 1 }).toFile(out('pwa-192x192.png'));
await sharp(rounded, { density: 300 }).resize(512, 512).png({ palette: true, quality: 92, effort: 10, dither: 1 }).toFile(out('pwa-512x512.png'));
await sharp(fullBleed, { density: 300 }).resize(512, 512).png({ palette: true, quality: 92, effort: 10, dither: 1 }).toFile(out('maskable-icon-512x512.png'));
await sharp(fullBleed, { density: 300 }).resize(180, 180).flatten({ background: '#f4effb' }).png({ palette: true, quality: 92, effort: 10, dither: 1 }).toFile(out('apple-touch-icon-180x180.png'));
console.log('Icons written to public/');
