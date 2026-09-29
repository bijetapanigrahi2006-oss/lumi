// Keypad input: one delegated listener for taps, plus a physical keyboard.
import { bloom } from './effects.js';

const KEYBOARD = {
  Enter: '=',
  '=': '=',
  Backspace: 'back',
  Escape: 'ac',
  Delete: 'ac',
  '+': '+',
  '-': '-',
  '*': '*',
  x: '*',
  '/': '/',
  '^': '^',
  '%': 'pct',
  '!': 'fact',
  '(': '(',
  ')': ')',
  '.': '.',
  ',': '.',
  p: 'pi',
  e: 'e',
  s: 'sin',
  c: 'cos',
  t: 'tan',
  l: 'ln',
  g: 'log',
  r: 'sqrt',
};

export function initKeypad(root, onKey, isBlocked, onTap) {
  for (const key of root.querySelectorAll('.key')) {
    const glow = document.createElement('span');
    glow.className = 'bloom';
    key.append(glow);
  }

  root.addEventListener(
    'pointerdown',
    (e) => {
      const key = e.target.closest('.key');
      if (!key) return;
      bloom(key, e);
      onTap?.(key, e);
    },
    { passive: true },
  );

  root.addEventListener('click', (e) => {
    const key = e.target.closest('[data-key]');
    if (key) onKey(key.dataset.key);
  });

  // iOS only shows :active press states when a touch listener exists.
  document.addEventListener('touchstart', () => {}, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || isBlocked()) return;
    const key = /^[0-9]$/.test(e.key) ? e.key : KEYBOARD[e.key];
    if (!key) return;
    e.preventDefault();
    onKey(key);
    const btn = root.querySelector(`[data-key="${CSS.escape(key)}"]`);
    if (btn) {
      btn.classList.add('is-down');
      setTimeout(() => btn.classList.remove('is-down'), 110);
    }
  });
}
