// Renders calculator state onto the display card.
import { preview } from '../engine/calculator.js';
import { ERRORS, MINUS, OP_TEXT, tokenText, toParts, formatResult } from '../engine/format.js';
import { settle, sheen, sparkle, shake, twinkle } from './effects.js';

const FIT_STEPS = [1, 0.84, 0.7, 0.58, 0.48];

export function resultHTML(n) {
  const p = toParts(n);
  let html = (p.neg ? MINUS : '') + p.int + (p.frac ? `.${p.frac}` : '');
  if (p.exp !== null) html += `<span class="exp">×10<sup>${p.exp < 0 ? MINUS : ''}${Math.abs(p.exp)}</sup></span>`;
  return html;
}

function tokenHTML(tok) {
  if (tok.t === 'op') return `<span class="op">${OP_TEXT[tok.v]}</span>`;
  if (tok.t === 'post' && tok.v === 'sq') return '<sup>2</sup>';
  if (tok.t === 'post' && tok.v === 'inv') return `<sup>${MINUS}1</sup>`;
  if (tok.t === 'num' && tok.frozen) return resultHTML(Number(tok.v));
  return tokenText(tok);
}

// pop: 'token' animates the newest token in, 'char' just the newest character.
function expressionHTML(tokens, pop = null) {
  const parts = tokens.map(tokenHTML);
  const i = parts.length - 1;
  if (pop === 'token' && i >= 0) {
    parts[i] = parts[i].startsWith('<span class="op">')
      ? parts[i].replace('class="op"', 'class="op pop"')
      : `<span class="pop">${parts[i]}</span>`;
  } else if (pop === 'char' && i >= 0) {
    parts[i] = `${parts[i].slice(0, -1)}<span class="pop">${parts[i].slice(-1)}</span>`;
  }
  return parts.join('');
}

function popMode(prev, next) {
  if (!prev || next.justEvaluated || next.error) return null;
  const a = prev.justEvaluated || prev.error ? [] : prev.tokens;
  const b = next.tokens;
  if (b.length > a.length) return 'token';
  const x = a[a.length - 1];
  const y = b[b.length - 1];
  if (b.length === a.length && y?.t === 'num' && !y.frozen && x?.t === 'num' && y.v.length > x.v.length) return 'char';
  return null;
}

export function createDisplay(els) {
  const { screen, expr, main, preview: previewEl, sr, sheenEl, sparklesEl, angleTag, angleKey, logoSpark } = els;

  // Shrinks the big line step by step until it fits, then keeps the end in view.
  function fit() {
    for (const f of FIT_STEPS) {
      main.style.setProperty('--fit', f);
      if (main.scrollWidth <= main.clientWidth + 1) break;
    }
    main.scrollLeft = main.scrollWidth;
    expr.scrollLeft = expr.scrollWidth;
  }

  function render(state, prev, key) {
    main.classList.toggle('is-error', !!state.error);

    if (state.error) {
      expr.innerHTML = `${expressionHTML(state.lastExpr)} =`;
      main.textContent = ERRORS[state.error];
      previewEl.textContent = '';
      sr.textContent = ERRORS[state.error];
      if (!prev?.error) shake(screen);
    } else if (state.justEvaluated) {
      const value = Number(state.tokens[0].v);
      expr.innerHTML = state.lastExpr ? `${expressionHTML(state.lastExpr)} =` : '';
      main.innerHTML = resultHTML(value);
      previewEl.textContent = '';
      if (state.entry) {
        settle(main);
        sheen(sheenEl);
        sparkle(sparklesEl);
        twinkle(logoSpark);
        sr.textContent = formatResult(value);
      } else if (key === 'load') {
        settle(main);
      }
    } else {
      expr.textContent = '';
      main.innerHTML = state.tokens.length ? expressionHTML(state.tokens, popMode(prev, state)) : '0';
      const p = preview(state);
      previewEl.textContent = p === null ? '' : formatResult(p);
    }

    const angle = state.angle.toUpperCase();
    angleTag.textContent = angle;
    angleKey.textContent = angle;
    angleKey.setAttribute('aria-label', `Angle mode: ${state.angle === 'deg' ? 'degrees' : 'radians'}`);
    fit();
  }

  addEventListener('resize', fit);
  document.fonts?.ready.then(fit);
  return { render, fit };
}
