// Home-screen icon artwork: a glossy 3D pearl calculator with a smiling screen,
// domed keys in the six theme colors and a golden sparkle, on a luminous pastel sky.
// `rounded` = transparent rounded corners ("any" icons); otherwise full-bleed (maskable/apple).
const KEYS = [
  ['#3b3b3b', '#1c1c1c'], // Classic Mono
  ['#c0aefa', '#8f78e6'], // Lavender Haze
  ['#ff9fb6', '#e0668a'], // Strawberry Milk
  ['#b3da90', '#76a852'], // Matcha Latte
  ['#9cb8f5', '#5f80d8'], // Blueberry Butter
  ['#ffab9c', '#ec6a58'], // Melody
];

function key([light, deep], i) {
  const cx = 206 + (i % 3) * 50;
  const cy = 286 + Math.floor(i / 3) * 52;
  return `
    <circle cx="${cx}" cy="${cy + 4}" r="18" fill="${deep}"/>
    <circle cx="${cx}" cy="${cy}" r="18" fill="url(#k${i})"/>
    <ellipse cx="${cx - 6}" cy="${cy - 7}" rx="6.5" ry="4.2" fill="#fff" opacity=".75" transform="rotate(-28 ${cx - 6} ${cy - 7})"/>`;
}

export function iconSVG({ rounded }) {
  const clip = rounded ? '<clipPath id="shape"><rect width="512" height="512" rx="114"/></clipPath>' : '';
  const open = rounded ? '<g clip-path="url(#shape)">' : '<g>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    ${clip}
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#cdbdfb"/><stop offset=".5" stop-color="#f6c1d6"/><stop offset="1" stop-color="#ffd9b8"/>
    </linearGradient>
    <radialGradient id="bloom" cx=".22" cy=".16" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="mint" cx=".95" cy=".95" r=".55"><stop offset="0" stop-color="#bfeee6" stop-opacity=".9"/><stop offset="1" stop-color="#bfeee6" stop-opacity="0"/></radialGradient>
    <linearGradient id="pearl" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f7f2ff"/><stop offset="1" stop-color="#e9e0fb"/></linearGradient>
    <linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbbdf0"/><stop offset="1" stop-color="#a996e0"/></linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a74e8"/><stop offset=".55" stop-color="#c784c9"/><stop offset="1" stop-color="#ff9aa9"/></linearGradient>
    <linearGradient id="screenGloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gold" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#fff1b0"/><stop offset=".45" stop-color="#ffd35c"/><stop offset="1" stop-color="#f0a72b"/></linearGradient>
    <filter id="lift" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#5a3b9e" flood-opacity=".32"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#b0721a" flood-opacity=".35"/></filter>
    ${KEYS.map((k, i) => `<radialGradient id="k${i}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${k[0]}"/><stop offset="1" stop-color="${k[1]}"/></radialGradient>`).join('')}
  </defs>
  ${open}
    <rect width="512" height="512" fill="url(#sky)"/>
    <rect width="512" height="512" fill="url(#mint)"/>
    <rect width="512" height="512" fill="url(#bloom)"/>
    <g fill="#fff" opacity=".8">
      <circle cx="86" cy="118" r="4"/><circle cx="430" cy="392" r="5"/><circle cx="96" cy="400" r="3"/><circle cx="420" cy="92" r="3"/>
    </g>
    <ellipse cx="256" cy="424" rx="112" ry="18" fill="#6a4aa8" opacity=".18" filter="url(#glow)"/>
  </g>

  <g filter="url(#lift)">
    <rect x="152" y="130" width="208" height="280" rx="60" fill="url(#side)"/>
    <rect x="152" y="112" width="208" height="280" rx="60" fill="url(#pearl)"/>
  </g>
  <rect x="154" y="114" width="204" height="276" rx="58" fill="none" stroke="#fff" stroke-width="4" opacity=".9"/>
  <path d="M180 136c20-10 60-12 96-10" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none" opacity=".9"/>

  <rect x="180" y="146" width="152" height="92" rx="26" fill="#6b54c7" opacity=".35"/>
  <rect x="180" y="142" width="152" height="92" rx="26" fill="url(#screen)"/>
  <rect x="180" y="142" width="152" height="92" rx="26" fill="url(#screenGloss)"/>
  <ellipse cx="220" cy="198" rx="10" ry="6" fill="#ffc3d6" opacity=".9"/>
  <ellipse cx="292" cy="198" rx="10" ry="6" fill="#ffc3d6" opacity=".9"/>
  <ellipse cx="232" cy="184" rx="7" ry="9" fill="#fff"/>
  <ellipse cx="280" cy="184" rx="7" ry="9" fill="#fff"/>
  <circle cx="234" cy="181" r="2.4" fill="#8a74e8"/>
  <circle cx="282" cy="181" r="2.4" fill="#8a74e8"/>
  <path d="M246 200q10 10 20 0" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>

  ${KEYS.map(key).join('')}

  <g filter="url(#soft)">
    <path d="M362 70c4 30 22 48 52 52-30 4-48 22-52 52-4-30-22-48-52-52 30-4 48-22 52-52z" fill="url(#gold)" stroke="#fff" stroke-width="8" paint-order="stroke" stroke-linejoin="round"/>
  </g>
  <path d="M352 104c2-8 6-13 12-16" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>
  <path d="M420 172c1.6 12 8.6 19 20.6 20.6-12 1.6-19 8.6-20.6 20.6-1.6-12-8.6-19-20.6-20.6 12-1.6 19-8.6 20.6-20.6z" fill="#fff" opacity=".95"/>
</svg>`;
}
