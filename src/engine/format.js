// Number and error formatting. Pure string work — no DOM.

export const MINUS = '−'; // typographic minus "−"

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

export const ERRORS = {
  div0: "Can't divide by 0",
  overflow: 'Too big',
  domain: 'Not defined',
  syntax: 'Oops, check that',
};

/** Indian digit grouping: 1234567 → 12,34,567 */
export function groupIndian(intDigits) {
  if (intDigits.length <= 3) return intDigits;
  const last3 = intDigits.slice(-3);
  const rest = intDigits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

/** A number the user is still typing: keep their trailing "." and zeros. */
export function formatTyped(v) {
  const dot = v.indexOf('.');
  if (dot === -1) return groupIndian(v);
  return `${groupIndian(v.slice(0, dot) || '0')}.${v.slice(dot + 1)}`;
}

// Expands a positive number to plain [int, frac] digit strings (no exponent).
function plainDigits(abs, sig) {
  const [mant, e = '0'] = abs.toPrecision(sig).split('e');
  const [ip, fp = ''] = mant.split('.');
  let digits = ip + fp;
  let point = ip.length + Number(e);
  if (point <= 0) {
    digits = '0'.repeat(1 - point) + digits;
    point = 1;
  }
  if (point > digits.length) digits += '0'.repeat(point - digits.length);
  const int = digits.slice(0, point).replace(/^0+(?=\d)/, '');
  const frac = digits.slice(point).replace(/0+$/, '');
  return [int, frac];
}

/**
 * Splits a result into display parts.
 * Returns { neg, int, frac, exp } — `exp` is null unless scientific notation is needed.
 */
export function toParts(n) {
  if (n === 0 || Object.is(n, -0)) return { neg: false, int: '0', frac: '', exp: null };
  const neg = n < 0;
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-9) {
    const [m, e] = abs.toExponential(9).split('e');
    const [int, frac = ''] = m.split('.');
    return { neg, int, frac: frac.replace(/0+$/, ''), exp: Number(e) };
  }
  // Show 12 significant digits, or every digit of a whole number (max 15).
  const intLen = abs >= 1 ? Math.floor(Math.log10(abs)) + 1 : 1;
  const [int, frac] = plainDigits(abs, Math.min(15, Math.max(12, intLen)));
  return { neg, int: groupIndian(int), frac, exp: null };
}

export function superscript(n) {
  return String(n)
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('');
}

/** A result as plain text, e.g. "−12,34,567.5" or "1.5×10¹⁸". */
export function formatResult(n) {
  const p = toParts(n);
  const body = p.int + (p.frac ? `.${p.frac}` : '');
  const exp = p.exp === null ? '' : `×10${superscript(p.exp)}`;
  return (p.neg ? MINUS : '') + body + exp;
}

export const OP_TEXT = { '+': '+', '-': MINUS, '*': '×', '/': '÷', '^': '^' };
export const FN_TEXT = { sin: 'sin(', cos: 'cos(', tan: 'tan(', ln: 'ln(', log: 'log(', sqrt: '√(' };
export const POST_TEXT = { pct: '%', fact: '!', sq: '²', inv: '⁻¹' };
export const CONST_TEXT = { pi: 'π', e: 'e' };

/** One token as plain text. */
export function tokenText(tok) {
  switch (tok.t) {
    case 'num':
      return tok.frozen ? formatResult(Number(tok.v)) : formatTyped(tok.v);
    case 'op':
      return OP_TEXT[tok.v];
    case 'neg':
      return MINUS;
    case 'post':
      return POST_TEXT[tok.v];
    case 'fn':
      return FN_TEXT[tok.v];
    case 'const':
      return CONST_TEXT[tok.v];
    case 'lp':
      return '(';
    case 'rp':
      return ')';
    default:
      return '';
  }
}

/** A whole expression as plain text, e.g. "12 + sin(30) × 2²". */
export function expressionText(tokens) {
  return tokens.map((tok) => (tok.t === 'op' ? ` ${tokenText(tok)} ` : tokenText(tok))).join('');
}
