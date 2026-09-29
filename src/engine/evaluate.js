// Parses and evaluates a calculator token list. No eval(), no Function().
//
// Token shapes (built by calculator.js):
//   { t: 'num', v: '12.5' }            number (string, as typed or a stored result)
//   { t: 'const', v: 'pi' | 'e' }
//   { t: 'op', v: '+' | '-' | '*' | '/' | '^' }
//   { t: 'neg' }                       unary minus
//   { t: 'post', v: 'pct' | 'fact' | 'sq' | 'inv' }
//   { t: 'fn', v: 'sin' | 'cos' | 'tan' | 'ln' | 'log' | 'sqrt' }   opens a bracket
//   { t: 'lp' } / { t: 'rp' }
//
// Grammar (lowest to highest precedence):
//   expr    := term (('+' | '-') term)*
//   term    := unary (('*' | '/') unary)*
//   unary   := 'neg' unary | power
//   power   := postfix ('^' unary)?          right-associative, so 2^3^2 = 2^9
//   postfix := primary ('pct' | 'fact' | 'sq' | 'inv')*
//   primary := num | const | '(' expr ')' | fn expr ')'

export class CalcError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // 'div0' | 'overflow' | 'domain' | 'syntax'
  }
}

const SIG_DIGITS = 15;

/** Rounds away binary floating-point noise: 0.1 + 0.2 → 0.3. */
export function clean(n) {
  if (!Number.isFinite(n)) return n;
  const r = Number(n.toPrecision(SIG_DIGITS));
  return Object.is(r, -0) ? 0 : r;
}

function parse(tokens) {
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  function expr() {
    let node = term();
    while (peek()?.t === 'op' && (peek().v === '+' || peek().v === '-')) {
      const op = next().v;
      node = { k: 'bin', op, a: node, b: term() };
    }
    return node;
  }

  function term() {
    let node = unary();
    while (peek()?.t === 'op' && (peek().v === '*' || peek().v === '/')) {
      const op = next().v;
      node = { k: 'bin', op, a: node, b: unary() };
    }
    return node;
  }

  function unary() {
    if (peek()?.t === 'neg') {
      next();
      return { k: 'neg', a: unary() };
    }
    return power();
  }

  function power() {
    const base = postfix();
    if (peek()?.t === 'op' && peek().v === '^') {
      next();
      return { k: 'bin', op: '^', a: base, b: unary() };
    }
    return base;
  }

  function postfix() {
    let node = primary();
    while (peek()?.t === 'post') node = { k: 'post', op: next().v, a: node };
    return node;
  }

  function primary() {
    const tok = next();
    if (!tok) throw new CalcError('syntax');
    if (tok.t === 'num') {
      const v = Number(tok.v);
      if (Number.isNaN(v)) throw new CalcError('syntax');
      return { k: 'num', v };
    }
    if (tok.t === 'const') return { k: 'num', v: tok.v === 'pi' ? Math.PI : Math.E };
    if (tok.t === 'lp' || tok.t === 'fn') {
      const inner = expr();
      if (peek()?.t === 'rp') next(); // brackets left open are closed implicitly
      return tok.t === 'fn' ? { k: 'fn', name: tok.v, a: inner } : inner;
    }
    throw new CalcError('syntax');
  }

  const tree = expr();
  if (i < tokens.length) throw new CalcError('syntax');
  return tree;
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new CalcError('domain');
  if (n > 170) throw new CalcError('overflow');
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

const EXACT_SIN_DEG = { 0: 0, 30: 0.5, 90: 1, 150: 0.5, 180: 0, 210: -0.5, 270: -1, 330: -0.5 };
const EXACT_COS_DEG = { 0: 1, 60: 0.5, 90: 0, 120: -0.5, 180: -1, 240: -0.5, 270: 0, 300: 0.5 };

function trig(name, x, angle) {
  if (angle === 'deg') {
    const d = ((x % 360) + 360) % 360;
    if (name === 'sin' && d in EXACT_SIN_DEG) return EXACT_SIN_DEG[d];
    if (name === 'cos' && d in EXACT_COS_DEG) return EXACT_COS_DEG[d];
    if (name === 'tan') {
      if (d === 90 || d === 270) throw new CalcError('domain');
      if (d === 0 || d === 180) return 0;
      if (d === 45 || d === 225) return 1;
      if (d === 135 || d === 315) return -1;
    }
    x = (x * Math.PI) / 180;
  }
  const r = Math[name](x);
  return Math.abs(r) < 1e-14 ? 0 : r; // sin(π) in radians → 0, not 1.2e-16
}

function applyFn(name, x, angle) {
  switch (name) {
    case 'sin':
    case 'cos':
    case 'tan':
      return trig(name, x, angle);
    case 'sqrt':
      if (x < 0) throw new CalcError('domain');
      return Math.sqrt(x);
    case 'ln':
      if (x <= 0) throw new CalcError('domain');
      return Math.log(x);
    case 'log':
      if (x <= 0) throw new CalcError('domain');
      return Math.log10(x);
    default:
      throw new CalcError('syntax');
  }
}

export function applyBinary(op, a, b) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) throw new CalcError('div0');
      return a / b;
    case '^': {
      if (a === 0 && b < 0) throw new CalcError('div0');
      const r = Math.pow(a, b);
      if (Number.isNaN(r)) throw new CalcError('domain'); // e.g. (−8)^0.5
      return r;
    }
    default:
      throw new CalcError('syntax');
  }
}

function evalNode(node, angle) {
  switch (node.k) {
    case 'num':
      return node.v;
    case 'neg':
      return -evalNode(node.a, angle);
    case 'fn':
      return applyFn(node.name, evalNode(node.a, angle), angle);
    case 'post': {
      const x = evalNode(node.a, angle);
      if (node.op === 'pct') return x / 100;
      if (node.op === 'sq') return x * x;
      if (node.op === 'fact') return factorial(clean(x));
      if (node.op === 'inv') {
        if (x === 0) throw new CalcError('div0');
        return 1 / x;
      }
      throw new CalcError('syntax');
    }
    case 'bin': {
      const [a, b] = operands(node, angle);
      return applyBinary(node.op, a, b);
    }
    default:
      throw new CalcError('syntax');
  }
}

// Phone-style percent: in "a + b%" and "a − b%", b% means b percent *of a*.
function operands(node, angle) {
  const a = evalNode(node.a, angle);
  const isAddSub = node.op === '+' || node.op === '-';
  const b =
    isAddSub && node.b.k === 'post' && node.b.op === 'pct'
      ? (a * evalNode(node.b.a, angle)) / 100
      : evalNode(node.b, angle);
  return [a, b];
}

function finish(n) {
  if (Number.isNaN(n)) throw new CalcError('domain');
  if (!Number.isFinite(n)) throw new CalcError('overflow');
  return clean(n);
}

/**
 * Evaluates tokens. Returns { value, repeat } where `repeat` is the outermost
 * binary operation ({ op, operand }) so that pressing "=" again can repeat it.
 */
export function evaluate(tokens, angle = 'deg') {
  if (!tokens.length) throw new CalcError('syntax');
  const tree = parse(tokens);
  if (tree.k === 'bin') {
    const [a, b] = operands(tree, angle);
    return { value: finish(applyBinary(tree.op, a, b)), repeat: { op: tree.op, operand: b } };
  }
  return { value: finish(evalNode(tree, angle)), repeat: null };
}
