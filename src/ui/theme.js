// Theme + light/dark switching. Also recolors the browser-tab icon and status bar.
import { calm, reveal, twinkle } from './effects.js';

const root = document.documentElement;
const systemDark = matchMedia('(prefers-color-scheme: dark)');

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the choice just won't be remembered */
  }
}

function faviconSVG(body, screen, spark, bg) {
  const keys = [10, 14, 18].flatMap((x) => [19.8, 24.2].map((y) => `<circle cx="${x}" cy="${y}" r="1.4"/>`)).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect x="4.5" y="7.6" width="19" height="23" rx="5.5" fill="${body}"/>` +
    `<rect x="4.5" y="7.6" width="19" height="23" rx="5.5" fill="#000" opacity=".28"/>` +
    `<rect x="4.5" y="5.5" width="19" height="23" rx="5.5" fill="${body}"/>` +
    `<rect x="7.4" y="8.8" width="13.2" height="7.2" rx="2.3" fill="${screen}"/>` +
    `<rect x="10.6" y="10.6" width="7.8" height="1.6" rx=".8" fill="${body}"/>` +
    `<rect x="13.8" y="13.1" width="4.6" height="1.6" rx=".8" fill="${body}" opacity=".55"/>` +
    `<g fill="${screen}" opacity=".9">${keys}</g>` +
    `<path d="M25 1c.45 3.5 2.5 5.55 6 6-3.5.45-5.55 2.5-6 6-.45-3.5-2.5-5.55-6-6 3.5-.45 5.55-2.5 6-6z" ` +
    `fill="${spark}" stroke="${bg}" stroke-width="1.6" paint-order="stroke"/></svg>`
  );
}

export function initTheme({ chips, modeBtn, logoSpark, toast, onChange, onPick }) {
  const meta = document.querySelector('meta[name="theme-color"]');
  const icon = document.querySelector('link[rel="icon"]');

  function sync() {
    for (const chip of chips) chip.setAttribute('aria-checked', String(chip.dataset.themePick === root.dataset.theme));
    modeBtn.setAttribute('aria-label', root.dataset.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function updateMeta() {
    const cs = getComputedStyle(root);
    const c = (name) => cs.getPropertyValue(name).trim();
    meta.content = c('--bg');
    icon.href = `data:image/svg+xml,${encodeURIComponent(faviconSVG(c('--accent'), c('--screen-top'), c('--accent-2'), c('--bg')))}`;
  }

  function apply(theme, mode, origin) {
    if (theme === root.dataset.theme && mode === root.dataset.mode) return;
    const themeChanged = theme !== root.dataset.theme;
    const change = () => {
      root.dataset.theme = theme;
      root.dataset.mode = mode;
      sync();
      if (themeChanged) onChange?.(theme);
    };
    if (origin && document.startViewTransition && !calm()) {
      root.classList.add('vt'); // colors switch instantly under the circular reveal
      const vt = document.startViewTransition(change);
      vt.ready.then(() => reveal(origin)).catch(() => {});
      vt.finished.finally(() => {
        root.classList.remove('vt');
        updateMeta();
      });
    } else {
      change();
      setTimeout(updateMeta, 450); // after the color cross-fade settles
    }
    twinkle(logoSpark);
  }

  function showToast(text) {
    toast.textContent = text;
    if (calm()) return;
    toast.animate(
      [
        { opacity: 0, transform: 'translateY(-8px) scale(0.9)' },
        { opacity: 1, transform: 'none', offset: 0.15 },
        { opacity: 1, transform: 'none', offset: 0.8 },
        { opacity: 0, transform: 'translateY(-4px)' },
      ],
      { duration: 1600, easing: 'ease-out' },
    );
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const name = chip.dataset.themePick;
      onPick?.(chip, name);
      if (!calm()) {
        chip.querySelector('.chip-ic').animate(
          [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(200deg) scale(1.3)', offset: 0.5 }, { transform: 'rotate(360deg) scale(1)' }],
          { duration: 620, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' },
        );
      }
      if (name === root.dataset.theme) return;
      write('lumi.theme', name);
      apply(name, root.dataset.mode, chip);
      showToast(chip.getAttribute('aria-label'));
    });
  }

  modeBtn.addEventListener('click', () => {
    const mode = root.dataset.mode === 'dark' ? 'light' : 'dark';
    write('lumi.mode', mode);
    onPick?.(modeBtn, root.dataset.theme);
    apply(root.dataset.theme, mode, modeBtn);
  });

  // Follow the phone's light/dark setting until the user picks one.
  systemDark.addEventListener('change', () => {
    if (!read('lumi.mode')) apply(root.dataset.theme, systemDark.matches ? 'dark' : 'light');
  });

  sync();
  updateMeta();
}
