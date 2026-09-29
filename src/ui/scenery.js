// Theme scenery: stickers, falling petals, fairy lights, particles and confetti.
// Ambient animation pauses after 30 s without interaction to save battery.
import { SETS, FALLING, PARTICLES, stickerSVG, artSVG, particleSVG } from './sticker-art.js';
import { calm } from './effects.js';

const root = document.documentElement;
const IDLE_MS = 30000;
const CHIP_ICONS = {
  mono: ['star', 'f1', 'fw'],
  lavender: ['moon', 'f4'],
  strawberry: ['strawberry'],
  matcha: ['leaf', 'f1'],
  blueberry: ['blueberry'],
  melody: ['note', 'f1'],
};
// Garland bulbs sit on two swoops of the wire: y = 3 + 70·t·(1 − t) in a 30px-tall box.
const BULBS = [0.12, 0.32, 0.5, 0.68, 0.88].flatMap((t, i) => [
  { x: 50 * t, y: 3 + 70 * t * (1 - t), c: (i % 3) + 1 },
  { x: 50 + 50 * t, y: 3 + 70 * t * (1 - t), c: ((i + 1) % 3) + 1 },
]);

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const theme = () => (SETS[root.dataset.theme] ? root.dataset.theme : 'mono');

function sticker(entry, cls, i) {
  return `<span class="st ${cls}" style="--i:${i}"><span class="fl">${stickerSVG(...entry)}</span></span>`;
}

export function initScenery({ board, edge, bgStickers, falls, garland, fxLayer, emptySticker, chips }) {
  for (const chip of chips) chip.querySelector('.chip-ic').innerHTML = stickerSVG(...CHIP_ICONS[chip.dataset.themePick]);

  garland.insertAdjacentHTML(
    'beforeend',
    BULBS.map((b, i) => `<span class="bulb" style="--x:${b.x}%;--y:${b.y}px;--c:var(--bulb-${b.c});--d:${-i * 0.37}s"></span>`).join(''),
  );

  function render(animate = false) {
    const set = SETS[theme()];
    board.innerHTML = sticker(set[0], 'b1', 0) + sticker(set[1], 'b2', 1);
    edge.innerHTML = sticker(set[2], 'e1', 2);
    bgStickers.innerHTML = set.slice(2, 8).map((s, i) => sticker(s, 'bg-st', i)).join('');
    emptySticker.innerHTML = stickerSVG(...set[0]);
    const fall = FALLING[theme()];
    falls.innerHTML = Array.from({ length: 9 }, (_, i) => {
      const dur = rand(11, 19);
      return (
        `<span class="fall" style="--x:${(i * 11.5 + rand(0, 6)).toFixed(1)}%;--sz:${rand(14, 26).toFixed(0)}px;` +
        `--op:${rand(0.55, 0.85).toFixed(2)};--dur:${dur.toFixed(1)}s;--del:${(-rand(0, dur)).toFixed(1)}s;--sway:${rand(10, 26).toFixed(0)}px">` +
        `${artSVG(...fall[i % fall.length])}</span>`
      );
    }).join('');
    if (animate && !calm()) {
      [...board.children, ...edge.children].forEach((st, i) =>
        st.animate(
          [
            { transform: 'scale(0) rotate(-40deg)' },
            { transform: 'scale(1.18) rotate(8deg)', offset: 0.65 },
            { transform: 'scale(1) rotate(0deg)' },
          ],
          { duration: 560, delay: 180 + i * 90, easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)', fill: 'backwards' },
        ),
      );
    }
  }

  // ─── Particles ────────────────────────────────────────────
  function spawn(x, y, size, html) {
    const el = document.createElement('span');
    el.className = 'pt';
    el.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px`;
    el.innerHTML = html;
    fxLayer.append(el);
    return el;
  }

  function burst(x, y, count = 4, spread = 1) {
    if (calm()) return;
    const kinds = PARTICLES[theme()];
    for (let i = 0; i < count; i++) {
      const el = spawn(x, y, rand(9, 15), particleSVG(...pick(kinds)));
      const a = rand(0, Math.PI * 2);
      const d = rand(26, 58) * spread;
      const dx = Math.cos(a) * d;
      const dy = Math.sin(a) * d - 12;
      const rot = rand(-200, 200);
      el.animate(
        [
          { transform: 'translate(0,0) scale(0.3) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) scale(1) rotate(${rot}deg)`, opacity: 1, offset: 0.6 },
          { transform: `translate(${dx * 1.15}px,${dy + 16}px) scale(0.5) rotate(${rot * 1.3}deg)`, opacity: 0 },
        ],
        { duration: rand(600, 820), easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
      ).onfinish = () => el.remove();
    }
  }

  /** Mini stickers pop out of `from` and tumble down. */
  function confetti(from, count = 10) {
    if (calm()) return;
    const r = from.getBoundingClientRect();
    const set = SETS[theme()];
    for (let i = 0; i < count; i++) {
      const el = spawn(r.left + r.width * rand(0.3, 0.9), r.top + r.height * 0.55, rand(18, 28), stickerSVG(...pick(set)));
      const dx = rand(-150, 150);
      const up = -rand(70, 170);
      const rot = rand(-260, 260);
      el.animate(
        [
          { transform: 'translate(0,0) scale(0.2) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' },
          { transform: `translate(${dx * 0.6}px,${up}px) scale(1) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.38, easing: 'cubic-bezier(0.5, 0, 0.8, 0.6)' },
          { transform: `translate(${dx}px,${up + 260}px) scale(0.9) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: rand(1100, 1500), delay: i * 18 },
      ).onfinish = () => el.remove();
    }
  }

  // ─── Sticker reactions ────────────────────────────────────
  const stickers = () => [...board.querySelectorAll('.st'), ...edge.querySelectorAll('.st')];

  function celebrate() {
    if (calm()) return;
    stickers().forEach((st, i) =>
      st.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-10px) scale(1.08)', offset: 0.4 }, { transform: 'translateY(0)' }],
        { duration: 540, delay: i * 80, easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' },
      ),
    );
  }

  function dizzy() {
    if (calm()) return;
    stickers().forEach((st) =>
      st.animate(
        [{ transform: 'rotate(0)' }, { transform: 'rotate(-16deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }],
        { duration: 700, easing: 'ease-out' },
      ),
    );
  }

  function jelly(el) {
    if (calm()) return;
    el.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.25, 0.8)' },
        { transform: 'scale(0.88, 1.12)' },
        { transform: 'scale(1.06, 0.95)' },
        { transform: 'scale(1)' },
      ],
      { duration: 620, easing: 'ease-out' },
    );
  }

  // Tapping a sticker makes it wobble and sparkle.
  for (const host of [board, edge, bgStickers]) {
    host.addEventListener('pointerdown', (e) => {
      const st = e.target.closest('.st');
      if (!st) return;
      jelly(st);
      const r = st.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 6, 1.2);
    });
  }

  // ─── Idle: pause ambient animation after 30 s ─────────────
  let idleTimer;
  function wake() {
    root.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => root.classList.add('idle'), IDLE_MS);
  }
  addEventListener('pointerdown', wake, { passive: true });
  addEventListener('keydown', wake);
  wake();

  render();
  return { render, burst, confetti, celebrate, dizzy, jelly };
}
