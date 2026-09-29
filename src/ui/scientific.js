// The ƒx toggle for the scientific panel (always visible in landscape).
import { cascade } from './effects.js';

export function initScientific({ btn, panel }, onToggle) {
  const root = document.documentElement;
  const sync = () => btn.setAttribute('aria-expanded', String(root.classList.contains('sci-open')));

  btn.addEventListener('click', () => {
    const open = root.classList.toggle('sci-open');
    try {
      localStorage.setItem('lumi.sci', open ? '1' : '0');
    } catch {
      /* not remembered in private mode */
    }
    sync();
    if (open) cascade(panel.children);
    onToggle();
  });

  sync();
}
