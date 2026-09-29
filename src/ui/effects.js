// Subtle, one-off effects. Each runs only in response to a tap, animates only
// transform/opacity, and is skipped entirely when the user prefers reduced motion.

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const calm = () => reducedMotion.matches;

const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

/** A soft light bloom spreading from the tap point. */
export function bloom(key, event) {
  const el = key.querySelector('.bloom');
  if (calm() || !el) return;
  const r = key.getBoundingClientRect();
  el.style.left = `${event.clientX - r.left}px`;
  el.style.top = `${event.clientY - r.top}px`;
  el.animate(
    [
      { opacity: 0.16, transform: 'translate(-50%, -50%) scale(0.15)' },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' },
    ],
    { duration: 520, easing: EASE_OUT },
  );
}

/** The result glides into place. */
export function settle(el) {
  if (calm()) return;
  el.animate(
    [
      { opacity: 0.2, transform: 'translateY(10px) scale(0.985)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 300, easing: EASE_OUT },
  );
}

/** A pearl sheen sweeps once across the display. */
export function sheen(el) {
  if (calm()) return;
  el.animate(
    [
      { opacity: 0, transform: 'translateX(-100%)' },
      { opacity: 1, offset: 0.35 },
      { opacity: 0, transform: 'translateX(100%)' },
    ],
    { duration: 900, easing: 'ease-in-out' },
  );
}

/** Three tiny sparkles twinkle beside the result. */
export function sparkle(container) {
  if (calm()) return;
  [...container.children].forEach((star, i) => {
    star.animate(
      [
        { opacity: 0, transform: 'scale(0) rotate(0deg)' },
        { opacity: 1, transform: 'scale(1) rotate(45deg)', offset: 0.45 },
        { opacity: 0, transform: 'scale(0.3) rotate(90deg)' },
      ],
      { duration: 720, delay: i * 90, easing: 'ease-out' },
    );
  });
}

/** A gentle "no" shake for errors. */
export function shake(el) {
  if (calm()) return;
  el.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(0)' },
    ],
    { duration: 360, easing: 'ease-out' },
  );
}

/** The logo's sparkle turns and glints. */
export function twinkle(el) {
  if (calm() || !el) return;
  el.animate(
    [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.35) rotate(45deg)', offset: 0.5 },
      { transform: 'scale(1) rotate(90deg)' },
    ],
    { duration: 700, easing: EASE_OUT },
  );
}

/** Elements drift in one after another. */
export function cascade(elements, step = 14) {
  if (calm()) return;
  [...elements].forEach((el, i) => {
    el.animate(
      [
        { opacity: 0, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 240, delay: i * step, easing: EASE_OUT, fill: 'backwards' },
    );
  });
}

/** Circular reveal of a new theme, growing from `origin` (View Transitions). */
export function reveal(origin) {
  const r = origin.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
    { duration: 640, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
  );
}
