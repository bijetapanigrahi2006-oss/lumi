// The calculator's input state machine. Pure functions: press(state, key) → new state.
//
// Keys: '0'–'9', '.', '+', '-', '*', '/', '^', '=', 'ac', 'back', 'sign',
//       'pct', 'fact', 'sq', 'inv', '(', ')', 'sin', 'cos', 'tan', 'ln', 'log',
//       'sqrt', 'pi', 'e', 'angle'

import { evaluate, applyBinary, clean, CalcError } from './evaluate.js';

const MAX_DIGITS = 15;
const MAX_TOKENS = 120;
const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'ln', 'log', 'sqrt']);
const POSTFIX = new Set(['pct', 'fact', 'sq', 'inv']);
const OPERATORS = new Set(['+', '-', '*', '/', '^']);

export function initialState(angle = 'deg') {
  return {
    tokens: [], // the expression being built
    angle, // 'deg' | 'rad'
    justEvaluated: false, // a result is showing
    lastExpr: null, // tokens of the expression that produced the result (or the error)
    repeat: null, // { op, operand } so "=" again repeats the last operation
    error: null, // 'div0' | 'overflow' | 'domain' | 'syntax'
    entry: null, // { tokens, value } — set only on the press that produced a new result
  };
}

const num = (v, frozen = false) => (frozen ? { t: 'num', v, frozen: true } : { t: 'num', v });
const last = (tokens) => tokens[tokens.length - 1];
const endsOperand = (tok) => !!tok && (tok.t === 'num' || tok.t === 'const' || tok.t === 'rp' || tok.t === 'post');
const isIncomplete = (tok) => !!tok && (tok.t === 'op' || tok.t === 'neg' || tok.t === 'fn' || tok.t === 'lp');
const digitCount = (v) => v.replace(/[^0-9]/g, '').length;

export function openBrackets(tokens) {
  let depth = 0;
  for (const tok of tokens) {
    if (tok.t === 'lp' || tok.t === 'fn') depth++;
    else if (tok.t === 'rp') depth--;
  }
  return depth;
}

/** Drops trailing tokens that can't be evaluated yet ("5 × " → "5"). */
function trimIncomplete(tokens) {
  const out = [...tokens];
  while (isIncomplete(last(out))) out.pop();
  return out;
}

function closeBrackets(tokens) {
  const out = [...tokens];
  for (let n = openBrackets(out); n > 0; n--) out.push({ t: 'rp' });
  return out;
}

// "5." → "5" once the number is finished.
function tidyLastNumber(tokens) {
  const tok = last(tokens);
  if (tok?.t === 'num' && !tok.frozen && tok.v.endsWith('.')) {
    tokens[tokens.length - 1] = num(tok.v.slice(0, -1) || '0');
  }
}

// Removes a stored result (and a minus sign attached to it) so a fresh number can replace it.
function dropFrozen(tokens) {
  if (last(tokens)?.frozen) {
    tokens.pop();
    if (last(tokens)?.t === 'neg') tokens.pop();
  }
}

function startFresh(s) {
  s.tokens = [];
  s.justEvaluated = false;
  s.lastExpr = null;
  s.repeat = null;
}

// Continue from the result that is showing (e.g. an operator after "=").
function continueFromResult(s) {
  s.justEvaluated = false;
  s.lastExpr = null;
}

// Index where the operand that ends the expression starts, or -1 if there is none.
function operandStart(tokens) {
  let i = tokens.length - 1;
  if (!endsOperand(tokens[i])) return -1;
  while (tokens[i].t === 'post') i--;
  if (tokens[i].t === 'rp') {
    let depth = 0;
    for (; i >= 0; i--) {
      if (tokens[i].t === 'rp') depth++;
      else if (tokens[i].t === 'lp' || tokens[i].t === 'fn') depth--;
      if (depth === 0) break;
    }
  }
  return i;
}

function inputDigit(s, d) {
  if (s.justEvaluated) startFresh(s);
  const tok = last(s.tokens);
  if (tok?.t === 'num' && !tok.frozen) {
    if (digitCount(tok.v) >= MAX_DIGITS) return;
    s.tokens[s.tokens.length - 1] = num(tok.v === '0' ? d : tok.v + d);
    return;
  }
  dropFrozen(s.tokens);
  if (endsOperand(last(s.tokens))) s.tokens.push({ t: 'op', v: '*' }); // "(2+3)4" → "(2+3)×4"
  s.tokens.push(num(d));
}

function inputDecimal(s) {
  if (s.justEvaluated) startFresh(s);
  const tok = last(s.tokens);
  if (tok?.t === 'num' && !tok.frozen) {
    if (!tok.v.includes('.')) s.tokens[s.tokens.length - 1] = num(tok.v + '.');
    return;
  }
  dropFrozen(s.tokens);
  if (endsOperand(last(s.tokens))) s.tokens.push({ t: 'op', v: '*' });
  s.tokens.push(num('0.'));
}

function inputOperator(s, op) {
  if (s.justEvaluated) continueFromResult(s);
  const tok = last(s.tokens);
  if (!tok) {
    if (op === '-') s.tokens.push({ t: 'neg' });
    else s.tokens.push(num('0'), { t: 'op', v: op });
    return;
  }
  if (tok.t === 'neg') {
    if (op === '-') return;
    s.tokens.pop(); // "5 × −" then "+" → "5 +"
    const before = last(s.tokens);
    if (before?.t === 'op') s.tokens[s.tokens.length - 1] = { t: 'op', v: op };
    return;
  }
  if (tok.t === 'op') {
    if (op === '-' && tok.v !== '+' && tok.v !== '-') s.tokens.push({ t: 'neg' }); // "5 × −3"
    else s.tokens[s.tokens.length - 1] = { t: 'op', v: op };
    return;
  }
  if (tok.t === 'lp' || tok.t === 'fn') {
    if (op === '-') s.tokens.push({ t: 'neg' });
    return;
  }
  tidyLastNumber(s.tokens);
  s.tokens.push({ t: 'op', v: op });
}

function toggleSign(s) {
  if (s.justEvaluated) continueFromResult(s);
  const tok = last(s.tokens);
  if (tok?.t === 'neg') {
    s.tokens.pop();
    return;
  }
  const i = operandStart(s.tokens);
  if (i === -1) {
    s.tokens.push({ t: 'neg' }); // the next number will be negative
    return;
  }
  if (i === s.tokens.length - 1 && s.tokens[i].frozen) {
    s.tokens[i] = num(String(-Number(s.tokens[i].v)), true);
    return;
  }
  if (s.tokens[i - 1]?.t === 'neg') s.tokens.splice(i - 1, 1);
  else s.tokens.splice(i, 0, { t: 'neg' });
}

function inputPostfix(s, p) {
  if (s.justEvaluated) continueFromResult(s);
  if (!endsOperand(last(s.tokens))) return;
  tidyLastNumber(s.tokens);
  s.tokens.push({ t: 'post', v: p });
}

function inputFunction(s, name) {
  if (s.justEvaluated) {
    continueFromResult(s); // wrap the result: 25 → √(25
    s.tokens.unshift({ t: 'fn', v: name });
    return;
  }
  if (endsOperand(last(s.tokens))) {
    tidyLastNumber(s.tokens);
    s.tokens.push({ t: 'op', v: '*' });
  }
  s.tokens.push({ t: 'fn', v: name });
}

function inputConstant(s, c) {
  if (s.justEvaluated) startFresh(s);
  if (endsOperand(last(s.tokens))) {
    tidyLastNumber(s.tokens);
    s.tokens.push({ t: 'op', v: '*' });
  }
  s.tokens.push({ t: 'const', v: c });
}

function openBracket(s) {
  if (s.justEvaluated) startFresh(s);
  if (endsOperand(last(s.tokens))) {
    tidyLastNumber(s.tokens);
    s.tokens.push({ t: 'op', v: '*' });
  }
  s.tokens.push({ t: 'lp' });
}

function closeBracket(s) {
  if (s.justEvaluated || openBrackets(s.tokens) === 0) return;
  if (!endsOperand(last(s.tokens))) return;
  tidyLastNumber(s.tokens);
  s.tokens.push({ t: 'rp' });
}

function backspace(s) {
  if (s.justEvaluated) {
    startFresh(s);
    return;
  }
  const tok = last(s.tokens);
  if (!tok) return;
  if (tok.t === 'num' && !tok.frozen && tok.v.length > 1) {
    s.tokens[s.tokens.length - 1] = num(tok.v.slice(0, -1));
  } else {
    s.tokens.pop();
  }
}

function fail(s, err, exprTokens) {
  if (!(err instanceof CalcError)) throw err;
  s.error = err.code;
  s.lastExpr = exprTokens;
  s.tokens = exprTokens;
  s.justEvaluated = false;
  s.repeat = null;
}

function equals(s) {
  if (s.justEvaluated) {
    if (!s.repeat) return;
    const prev = Number(s.tokens[0].v);
    const expr = [num(s.tokens[0].v, true), { t: 'op', v: s.repeat.op }, num(String(clean(s.repeat.operand)), true)];
    try {
      const value = clean(applyBinary(s.repeat.op, prev, s.repeat.operand));
      if (!Number.isFinite(value)) throw new CalcError('overflow');
      s.lastExpr = expr;
      s.tokens = [num(String(value), true)];
      s.entry = { tokens: expr, value };
    } catch (err) {
      fail(s, err, expr);
    }
    return;
  }
  const expr = closeBrackets(trimIncomplete(s.tokens));
  if (!expr.length) return;
  try {
    const { value, repeat } = evaluate(expr, s.angle);
    s.lastExpr = expr;
    s.tokens = [num(String(value), true)];
    s.justEvaluated = true;
    s.repeat = repeat;
    if (expr.length > 1) s.entry = { tokens: expr, value };
  } catch (err) {
    fail(s, err, expr);
  }
}

export function press(state, key) {
  const s = { ...state, tokens: [...state.tokens], entry: null };

  if (s.error) {
    s.error = null;
    if (key === 'back') return s; // back to editing the expression that failed
    if (key !== 'angle') startFresh(s);
  }

  if (key === 'ac') return initialState(s.angle);
  if (key === 'angle') return { ...s, angle: s.angle === 'deg' ? 'rad' : 'deg' };
  if (key === 'back') {
    backspace(s);
    return s;
  }
  if (key === '=') {
    equals(s);
    return s;
  }
  if (s.tokens.length >= MAX_TOKENS) return s;

  if (/^[0-9]$/.test(key)) inputDigit(s, key);
  else if (key === '.') inputDecimal(s);
  else if (OPERATORS.has(key)) inputOperator(s, key);
  else if (key === 'sign') toggleSign(s);
  else if (POSTFIX.has(key)) inputPostfix(s, key);
  else if (FUNCTIONS.has(key)) inputFunction(s, key);
  else if (key === 'pi' || key === 'e') inputConstant(s, key);
  else if (key === '(') openBracket(s);
  else if (key === ')') closeBracket(s);
  return s;
}

/** Puts a value (e.g. from history) on the display as a result. */
export function loadValue(state, value) {
  return { ...initialState(state.angle), tokens: [num(String(value), true)], justEvaluated: true };
}

/** Live result while typing, or null when there is nothing worth previewing. */
export function preview(state) {
  if (state.justEvaluated || state.error) return null;
  const expr = trimIncomplete(state.tokens);
  if (!expr.some((tok) => tok.t !== 'num' && tok.t !== 'neg')) return null; // a bare number
  try {
    return evaluate(closeBrackets(expr), state.angle).value;
  } catch {
    return null;
  }
}
