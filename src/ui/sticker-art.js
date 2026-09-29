// Sticker artwork. Every sticker is drawn on a 64×64 grid using color classes:
//   f1–f4 theme fills · fw white · fi ink · fb blush (and r1–r4/rw for rounded strokes).
// stickerSVG() stacks the art twice: a thick white "die-cut" edge behind, the art on top.
// Pure strings — no DOM — so it can be unit-tested and reused for confetti.

const n1 = (v) => Math.round(v * 10) / 10;

function starPoints(cx, cy, points, R, r, rot = -90) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    const rad = i % 2 ? r : R;
    out.push(`${n1(cx + rad * Math.cos(a))},${n1(cy + rad * Math.sin(a))}`);
  }
  return out.join(' ');
}

const ring = (c) => c.replace('f', 'r');

// A tiny kawaii face: blush, two eyes, a smile.
function face(cx, cy, ink = 'fi', s = 1) {
  const e = 5 * s;
  return (
    `<ellipse class="fb" cx="${n1(cx - e - 3.4 * s)}" cy="${n1(cy + 3.4 * s)}" rx="${n1(2.8 * s)}" ry="${n1(1.7 * s)}"/>` +
    `<ellipse class="fb" cx="${n1(cx + e + 3.4 * s)}" cy="${n1(cy + 3.4 * s)}" rx="${n1(2.8 * s)}" ry="${n1(1.7 * s)}"/>` +
    `<circle class="${ink}" cx="${n1(cx - e)}" cy="${cy}" r="${n1(2.1 * s)}"/>` +
    `<circle class="${ink}" cx="${n1(cx + e)}" cy="${cy}" r="${n1(2.1 * s)}"/>` +
    `<path class="${ink}-line" d="M${n1(cx - 2.6 * s)} ${n1(cy + 2.4 * s)}q${n1(2.6 * s)} ${n1(2.6 * s)} ${n1(5.2 * s)} 0"/>`
  );
}

const shine = (cx, cy, rx = 4.2, ry = 2.6, rot = -35) =>
  `<ellipse class="fw" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" opacity=".7"/>`;

const HEART = 'M32 55C15 43 6 33 6 22.5 6 14 12.5 8 20 8c5.5 0 9.7 3 12 7.6C34.3 11 38.5 8 44 8c7.5 0 14 6 14 14.5C58 33 49 43 32 55z';
const SPARKLE = 'M32 3c2 17 12 27 29 29-17 2-27 12-29 29-2-17-12-27-29-29 17-2 27-12 29-29z';
const CLOUD = 'M18 47c-7 0-12-5.4-12-12 0-6 5-11 11-10.6C18.6 16.6 25 11 33 11c8.4 0 15 6 16 14 5.6.4 9.6 5 9.6 10.6 0 6.2-4.8 11.4-11 11.4z';
const LEAF = 'M9 55C9 31 24 11 55 9c0 29-17 46-46 46z';
const DROP = 'M32 5S11 29 11 42c0 11.6 9.4 19 21 19s21-7.4 21-19C53 29 32 5 32 5z';

export const ART = {
  star: (c = 'f2', ink = 'fi') => `<polygon class="${c} ${ring(c)}" points="${starPoints(32, 35, 5, 27, 12.5)}"/>${face(32, 37, ink, 0.85)}`,

  heart: (c = 'f1', ink = 'fi') => `<path class="${c}" d="${HEART}"/>${shine(19, 19)}${face(32, 30, ink, 0.85)}`,

  sparkle: (c = 'f2') => `<path class="${c}" d="${SPARKLE}"/>${shine(26, 24, 2.4, 1.5, -45)}`,

  cloud: (c = 'fw', ink = 'fi') => `<path class="${c}" d="${CLOUD}"/>${face(32, 33, ink, 0.95)}`,

  flower: (petal = 'f2', center = 'f4') =>
    [-90, -18, 54, 126, 198]
      .map((a) => {
        const r = (a * Math.PI) / 180;
        return `<circle class="${petal}" cx="${n1(32 + 14.5 * Math.cos(r))}" cy="${n1(32 + 14.5 * Math.sin(r))}" r="11.5"/>`;
      })
      .join('') + `<circle class="${center}" cx="32" cy="32" r="9.5"/>${face(32, 31, 'fi', 0.55)}`,

  moon: (c = 'f4', ink = 'fi') =>
    `<path class="${c}" d="M40 5.5A27 27 0 1 0 59.5 43 22 22 0 0 1 40 5.5z"/>${face(25, 37, ink, 0.85)}` +
    `<path class="fw" d="M52 12c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5z" opacity=".9"/>`,

  smiley: (c = 'f4') => `<circle class="${c} ink-ring" cx="32" cy="32" r="26"/>${face(32, 30, 'fi', 1.35)}`,

  bolt: (c = 'f1') => `<path class="${c} ${ring(c)}" d="M37 4 12 36h17l-5 24 28-36H35l7-20z"/>`,

  strawberry: () =>
    `<path class="f1" d="M32 59C18 55 8.5 43 8.5 31 8.5 23 14.5 17.5 22 17.5c4 0 7.2 1.5 10 3 2.8-1.5 6-3 10-3 7.5 0 13.5 5.5 13.5 13.5C55.5 43 46 55 32 59z"/>` +
    `<path class="f2" d="M32 22c-4-7-10-9-15.5-7 4 1 7 3.6 8 6.6-5-1-8.5 1-10.5 4.4 6 .4 12-.8 18-3 6 2.2 12 3.4 18 3-2-3.4-5.5-5.4-10.5-4.4 1-3 4-5.6 8-6.6C42 13 36 15 32 22z"/>` +
    `<path class="f2-line thick" d="M32 18c0-5 2-9 5.5-11.5"/>` +
    [[17, 31], [47, 31], [21, 45], [43, 45], [32, 52], [13.5, 39], [50.5, 39]]
      .map(([x, y]) => `<ellipse class="f4" cx="${x}" cy="${y}" rx="1.3" ry="2"/>`)
      .join('') +
    face(32, 36, 'fi', 0.9),

  milk: () =>
    `<rect class="f4" x="15" y="22" width="34" height="37" rx="4"/>` +
    `<path class="f3" d="M15 23 22 10h20l7 13z"/>` +
    `<rect class="f4" x="21.5" y="4.5" width="21" height="7" rx="2"/>` +
    `<rect class="f3" x="19.5" y="30" width="25" height="22" rx="5"/>` +
    face(32, 39, 'fi', 0.8) +
    `<path class="fw" d="M32 50.5c-2.6-1.8-4-3.2-4-4.7 0-1 .8-1.8 1.8-1.8.9 0 1.7.5 2.2 1.3.5-.8 1.3-1.3 2.2-1.3 1 0 1.8.8 1.8 1.8 0 1.5-1.4 2.9-4 4.7z"/>`,

  bow: (loop = 'f1', knot = 'f3') =>
    `<path class="${loop}" d="M29 36 20 56l6.5-3 3.5 6 5-23z"/><path class="${loop}" d="M35 36l9 20-6.5-3-3.5 6-5-23z"/>` +
    `<path class="${loop}" d="M32 30C24 17 9 15 7 24c-2 9 7 16 25 10z"/><path class="${loop}" d="M32 30c8-13 23-15 25-6 2 9-7 16-25 10z"/>` +
    `${shine(15, 23, 3.4, 2, -30)}<rect class="${knot}" x="26.5" y="25.5" width="11" height="12" rx="4.5"/>`,

  leaf: (c = 'f1') => `<path class="${c}" d="${LEAF}"/><path class="fi-line faint" d="M13 51C23 41 33 29 46 18"/>${shine(40, 18, 4, 2.2, -40)}`,

  cup: () =>
    `<path class="f3-line steam" d="M23 17c-2.5-4 2.5-6 0-10M33 17c-2.5-4 2.5-6 0-10"/>` +
    `<path class="f4-line handle" d="M47 30c9 0 9 12 0 12"/>` +
    `<path class="f4" d="M11 25h38v13c0 10-8 17-19 17S11 48 11 38z"/>` +
    `<ellipse class="f1" cx="30" cy="25" rx="19" ry="5.2"/>` +
    `<path class="fw" d="M30 28.6c-2.4-1.6-3.8-2.9-3.8-4.3 0-1 .8-1.7 1.7-1.7.9 0 1.6.4 2.1 1.2.5-.8 1.2-1.2 2.1-1.2.9 0 1.7.7 1.7 1.7 0 1.4-1.4 2.7-3.8 4.3z"/>` +
    face(30, 40, 'fi', 0.85),

  dango: () =>
    `<path class="f3-line thick" d="M32 3v58"/>` +
    `<circle class="f2" cx="32" cy="16.5" r="10"/><circle class="f4" cx="32" cy="33" r="10"/><circle class="f1" cx="32" cy="49.5" r="10"/>` +
    face(32, 32.5, 'fi', 0.6),

  cookie: (c = 'f3') =>
    `<circle class="${c}" cx="32" cy="32" r="26"/>` +
    [[20, 20], [42, 17], [47, 36], [18, 42], [33, 48]].map(([x, y]) => `<circle class="fi" cx="${x}" cy="${y}" r="2.6" opacity=".7"/>`).join('') +
    face(32, 31, 'fi', 0.85),

  blueberry: () =>
    `<circle class="f1" cx="17" cy="21" r="12"/>${shine(13, 16, 3, 1.8)}` +
    `<circle class="f1" cx="37" cy="37" r="21"/>` +
    `<path class="fi" d="M31 17.5l3 3 3-4.5 3 4.5 3-3-1 6H32z" opacity=".35"/>` +
    `${shine(27, 26, 4.4, 2.6)}${face(37, 40, 'fi', 0.95)}`,

  sun: (c = 'f2') =>
    `<polygon class="${c} ${ring(c)}" points="${starPoints(32, 32, 12, 29, 22)}"/><circle class="${c}" cx="32" cy="32" r="19"/>${face(32, 31, 'fi', 1)}`,

  butter: () =>
    `<ellipse class="f4 ink-ring" cx="32" cy="46" rx="28" ry="10"/>` +
    `<rect class="f2" x="13" y="22" width="38" height="22" rx="6"/>` +
    `<rect class="fw" x="17" y="25" width="30" height="5" rx="2.5" opacity=".55"/>` +
    face(32, 35, 'fi', 0.9),

  butterfly: (a = 'f1', b = 'f2') =>
    `<path class="${a}" d="M31 30C24 11 7 9 7 21.5 7 30 18 34.5 31 32z"/><path class="${a}" d="M33 30c7-19 24-21 24-8.5 0 8.5-11 13-24 10.5z"/>` +
    `<path class="${b}" d="M31 34c-11 0-19 6-17 14 2 6 12 2 17-10z"/><path class="${b}" d="M33 34c11 0 19 6 17 14-2 6-12 2-17-10z"/>` +
    `<circle class="fw" cx="16" cy="21" r="3" opacity=".6"/><circle class="fw" cx="48" cy="21" r="3" opacity=".6"/>` +
    `<path class="fi-line" d="M31 23c-2-7-5-10-8-11M33 23c2-7 5-10 8-11"/><rect class="fi" x="29.5" y="21" width="5" height="27" rx="2.5"/>`,

  planet: (body = 'f3', band = 'f2') =>
    `<ellipse class="${band}-line band" cx="32" cy="32" rx="27" ry="8" transform="rotate(-18 32 32)"/>` +
    `<circle class="${body}" cx="32" cy="32" r="17"/>${shine(25, 24, 3.6, 2.2)}` +
    `<path class="${band}-line band" d="M6.3 40.3A27 8-18 0 0 57.7 23.7"/>${face(32, 33, 'fi', 0.75)}`,

  drop: (c = 'f3') => `<path class="${c}" d="${DROP}"/>${shine(24, 34, 3.2, 5.2, 20)}${face(32, 44, 'fi', 0.9)}`,

  // Cherry-blossom style: five notched petals.
  blossom: (petal = 'f3', center = 'f4') =>
    [0, 72, 144, 216, 288]
      .map((a) => `<path class="${petal}" transform="rotate(${a} 32 32)" d="${BLOSSOM_PETAL}"/>`)
      .join('') +
    `<circle class="${center}" cx="32" cy="32" r="5.5"/>` +
    [0, 72, 144, 216, 288]
      .map((a) => {
        const r = ((a - 90) * Math.PI) / 180;
        return `<circle class="fi" cx="${n1(32 + 9 * Math.cos(r))}" cy="${n1(32 + 9 * Math.sin(r))}" r="1.1" opacity=".35"/>`;
      })
      .join(''),

  petal: (c = 'f3') => `<path class="${c}" d="M32 59C17 49 11 35 15 21c2-7 8-11.5 12-9.5 2 1 3.4 3.6 5 7 1.6-3.4 3-6 5-7 4-2 10 2.5 12 9.5 4 14-2 28-17 38z"/>${shine(24, 30, 3, 6, 15)}`,

  note: (c = 'f1', ink = 'fi') =>
    `<rect class="${c}" x="31" y="8" width="5.5" height="41" rx="2.75"/>` +
    `<path class="${c}" d="M33 8c7 4 16 6 18 15 1 4.5-1 8.5-3.5 10.5 1-7-4.5-11-14.5-13z"/>` +
    `<ellipse class="${c}" cx="23" cy="49" rx="12.5" ry="9.5" transform="rotate(-22 23 49)"/>${face(23, 48.5, ink, 0.7)}`,

  notes: (c = 'f2', ink = 'fi') =>
    `<path class="${c}" d="M22 16 56 7v9l-34 9z"/>` +
    `<rect class="${c}" x="21" y="16" width="5" height="33" rx="2.5"/><rect class="${c}" x="51" y="7" width="5" height="34" rx="2.5"/>` +
    `<ellipse class="${c}" cx="16" cy="49" rx="10" ry="7.6" transform="rotate(-22 16 49)"/>` +
    `<ellipse class="${c}" cx="46" cy="41" rx="10" ry="7.6" transform="rotate(-22 46 41)"/>${face(46, 40.5, ink, 0.55)}`,

  vinyl: (label = 'f1') =>
    `<circle class="fi" cx="32" cy="32" r="27"/>` +
    `<circle class="fw-line faint" cx="32" cy="32" r="21"/><circle class="fw-line faint" cx="32" cy="32" r="16.5"/>` +
    `<circle class="${label}" cx="32" cy="32" r="10"/><circle class="f4" cx="32" cy="32" r="2.2"/>` +
    `<path class="fw-line" d="M14 22a21 21 0 0 1 9-9" opacity=".6"/>`,

  headphones: (band = 'f1', cup = 'f2') =>
    `<path class="${band}-line band-thick" d="M12 40V32a20 20 0 0 1 40 0v8"/>` +
    `<rect class="${cup}" x="6" y="34" width="14" height="22" rx="7"/><rect class="${cup}" x="44" y="34" width="14" height="22" rx="7"/>` +
    `${shine(11, 40, 1.8, 3.2, 0)}${shine(49, 40, 1.8, 3.2, 0)}`,

  piano: () =>
    `<rect class="f4" x="5" y="14" width="54" height="36" rx="7"/>` +
    [16, 27, 38, 49].map((x) => `<path class="fi-line faint" d="M${x} 20v28"/>`).join('') +
    [13, 24, 35, 46].map((x) => `<rect class="fi" x="${x}" y="14" width="6" height="20" rx="2"/>`).join('') +
    `<rect class="f1" x="5" y="10" width="54" height="8" rx="4"/>`,

  daisy: (center = 'f2') =>
    Array.from({ length: 10 }, (_, i) => `<ellipse class="fw" cx="32" cy="15" rx="5.4" ry="12" transform="rotate(${i * 36} 32 32)"/>`).join('') +
    `<circle class="${center}" cx="32" cy="32" r="10"/>${face(32, 31, 'fi', 0.6)}`,
};

const BLOSSOM_PETAL = 'M32 31c-7-5-10-13-7.5-19.5 1.3-3.3 3.7-4 5.6-2 .7.7 1.3 1.8 1.9 3 .6-1.2 1.2-2.3 1.9-3 1.9-2 4.3-1.3 5.6 2C42 18 39 26 32 31z';

// Flat little shapes for particle bursts.
const PARTICLE_ART = {
  heart: (c) => `<path class="${c}" d="${HEART}"/>`,
  sparkle: (c) => `<path class="${c}" d="${SPARKLE}"/>`,
  star: (c) => `<polygon class="${c} ${ring(c)}" points="${starPoints(32, 34, 5, 28, 13)}"/>`,
  leaf: (c) => `<path class="${c}" d="${LEAF}"/>`,
  dot: (c) => `<circle class="${c}" cx="32" cy="32" r="22"/>`,
  note: (c) => `<rect class="${c}" x="31" y="8" width="6" height="41" rx="3"/><path class="${c}" d="M33 8c7 4 16 6 18 15 1 4.5-1 8.5-3.5 10.5 1-7-4.5-11-14.5-13z"/><ellipse class="${c}" cx="23" cy="49" rx="12.5" ry="9.5" transform="rotate(-22 23 49)"/>`,
};

export const THEMES = ['mono', 'lavender', 'strawberry', 'matcha', 'blueberry', 'melody'];

// Each theme's sticker set — [art, ...args]. Order matters: board first, then edges.
export const SETS = {
  mono: [['star', 'f1', 'fw'], ['smiley', 'f4'], ['heart', 'f1', 'fw'], ['sparkle', 'f1'], ['flower', 'f4', 'f1'], ['moon', 'f1', 'fw'], ['bolt', 'f1'], ['cloud', 'f4']],
  lavender: [['moon', 'f4'], ['star', 'f2'], ['cloud', 'fw'], ['butterfly', 'f1', 'f2'], ['planet', 'f3', 'f2'], ['sparkle', 'f4'], ['heart', 'f1'], ['star', 'f4']],
  strawberry: [['strawberry'], ['heart', 'f3'], ['bow', 'f1', 'f3'], ['milk'], ['flower', 'f3', 'f4'], ['sparkle', 'f1'], ['strawberry'], ['heart', 'f1']],
  matcha: [['cup'], ['dango'], ['leaf', 'f1'], ['cookie'], ['flower', 'f2', 'f4'], ['heart', 'f1'], ['leaf', 'f3'], ['sparkle', 'f2']],
  blueberry: [['blueberry'], ['sun'], ['butter'], ['cloud', 'fw'], ['drop'], ['star', 'f2'], ['sparkle', 'f3'], ['heart', 'f2']],
  melody: [['note', 'f1'], ['vinyl', 'f1'], ['notes', 'f2'], ['headphones', 'f1', 'f2'], ['piano'], ['sparkle', 'f3'], ['note', 'f2'], ['heart', 'f1']],
};

// Things that drift down through each theme's background.
export const FALLING = {
  mono: [['blossom', 'f4', 'f1'], ['sparkle', 'f1'], ['daisy', 'f1'], ['heart', 'f1', 'fw'], ['petal', 'f4']],
  lavender: [['blossom', 'f1', 'f4'], ['sparkle', 'f4'], ['star', 'f2'], ['petal', 'f2'], ['moon', 'f4']],
  strawberry: [['strawberry'], ['blossom', 'f3', 'f4'], ['heart', 'f1'], ['petal', 'f3'], ['flower', 'f3', 'f4']],
  matcha: [['leaf', 'f1'], ['petal', 'f2'], ['blossom', 'f2', 'f4'], ['leaf', 'f3'], ['dango']],
  blueberry: [['blueberry'], ['daisy', 'f2'], ['sparkle', 'f2'], ['drop'], ['blossom', 'f3', 'f2']],
  melody: [['note', 'f1'], ['notes', 'f2'], ['sparkle', 'f3'], ['note', 'f3'], ['heart', 'f2']],
};

export const PARTICLES = {
  mono: [['sparkle', 'f1'], ['star', 'f3'], ['sparkle', 'f3'], ['heart', 'f1']],
  lavender: [['star', 'f4'], ['sparkle', 'f2'], ['heart', 'f1'], ['sparkle', 'f3']],
  strawberry: [['heart', 'f1'], ['heart', 'f3'], ['sparkle', 'f1'], ['dot', 'f2']],
  matcha: [['leaf', 'f1'], ['heart', 'f2'], ['leaf', 'f3'], ['dot', 'f2']],
  blueberry: [['dot', 'f1'], ['sparkle', 'f2'], ['star', 'f2'], ['dot', 'f3']],
  melody: [['note', 'f1'], ['note', 'f2'], ['sparkle', 'f3'], ['note', 'f3']],
};

export function stickerSVG(name, ...args) {
  const art = ART[name](...args);
  return `<svg class="stk" viewBox="-6 -6 76 76" aria-hidden="true"><g class="back">${art}</g><g class="art">${art}</g></svg>`;
}

/** Art without the die-cut edge (for falling petals and confetti). */
export function artSVG(name, ...args) {
  return `<svg class="stk" viewBox="0 0 64 64" aria-hidden="true"><g class="art">${ART[name](...args)}</g></svg>`;
}

export function particleSVG(name, color) {
  return `<svg class="stk" viewBox="0 0 64 64" aria-hidden="true">${PARTICLE_ART[name](color)}</svg>`;
}
