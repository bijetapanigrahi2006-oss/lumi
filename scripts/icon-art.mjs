// Home-screen icon artwork: a pearl calculator with theme-colored keys and a sparkle,
// on a soft blend of all five palettes. `rounded` = transparent rounded corners.
export function iconSVG({ rounded }) {
  const bg = rounded
    ? '<rect width="512" height="512" rx="114" fill="url(#base)"/><rect width="512" height="512" rx="114" fill="url(#g1)"/><rect width="512" height="512" rx="114" fill="url(#g2)"/><rect width="512" height="512" rx="114" fill="url(#g3)"/><rect width="512" height="512" rx="114" fill="url(#g4)"/>'
    : '<rect width="512" height="512" fill="url(#base)"/><rect width="512" height="512" fill="url(#g1)"/><rect width="512" height="512" fill="url(#g2)"/><rect width="512" height="512" fill="url(#g3)"/><rect width="512" height="512" fill="url(#g4)"/>';
  const keyColors = ['#b9a8f5', '#f4a3b8', '#a9c98d', '#9dbdf0', '#f7cd5b', '#2e2e2e'];
  const keys = keyColors
    .map((c, i) => `<circle cx="${206 + (i % 3) * 50}" cy="${270 + Math.floor(i / 3) * 56}" r="17" fill="${c}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4effb"/><stop offset="1" stop-color="#fdf3f1"/></linearGradient>
    <radialGradient id="g1" cx="0" cy="0" r=".75"><stop offset="0" stop-color="#cbbafc"/><stop offset="1" stop-color="#cbbafc" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="1" cy="0" r=".7"><stop offset="0" stop-color="#ffc6d4"/><stop offset="1" stop-color="#ffc6d4" stop-opacity="0"/></radialGradient>
    <radialGradient id="g3" cx="0" cy="1" r=".7"><stop offset="0" stop-color="#cfe3b8"/><stop offset="1" stop-color="#cfe3b8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g4" cx="1" cy="1" r=".75"><stop offset="0" stop-color="#c6dbf8"/><stop offset=".55" stop-color="#ffe7a8" stop-opacity=".6"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></radialGradient>
    <linearGradient id="pearl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f3eefb"/></linearGradient>
    <linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9c8aec"/><stop offset="1" stop-color="#e59ab4"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#f2b73a"/></linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#6b4fae" flood-opacity=".22"/></filter>
  </defs>
  ${bg}
  <g filter="url(#soft)">
    <rect x="156" y="120" width="200" height="276" rx="56" fill="url(#pearl)"/>
  </g>
  <rect x="157.5" y="121.5" width="197" height="273" rx="54.5" fill="none" stroke="#ffffff" stroke-width="3"/>
  <rect x="186" y="152" width="140" height="66" rx="20" fill="url(#scr)"/>
  <rect x="204" y="176" width="58" height="8" rx="4" fill="#ffffff" opacity=".75"/>
  <rect x="204" y="192" width="34" height="8" rx="4" fill="#ffffff" opacity=".45"/>
  ${keys}
  <path d="M356 76c3.6 28 20 44.4 48 48-28 3.6-44.4 20-48 48-3.6-28-20-44.4-48-48 28-3.6 44.4-20 48-48z" fill="url(#gold)" stroke="#ffffff" stroke-width="9" paint-order="stroke" stroke-linejoin="round"/>
</svg>`;
}
