import { describe, it, expect } from 'vitest';
import { initialState, press, preview, loadValue } from '../src/engine/calculator.js';
import { expressionText, formatResult } from '../src/engine/format.js';

// Presses space-separated keys, e.g. run('2 + 3 =').
function run(keys, state = initialState()) {
  return keys.split(' ').filter(Boolean).reduce(press, state);
}
const result = (s) => Number(s.tokens[0].v);
const shown = (s) => expressionText(s.tokens);

describe('basic arithmetic', () => {
  it('respects operator precedence', () => {
    expect(result(run('2 + 3 * 4 ='))).toBe(14);
    expect(result(run('1 0 - 4 / 2 ='))).toBe(8);
  });
  it('cleans floating point noise', () => {
    expect(result(run('. 1 + . 2 ='))).toBe(0.3);
    expect(result(run('1 . 1 * 1 . 1 ='))).toBe(1.21);
  });
  it('handles brackets and closes open ones on =', () => {
    expect(result(run('( 2 + 3 ) * 4 ='))).toBe(20);
    expect(result(run('2 * ( 3 + 4 ='))).toBe(14);
  });
  it('adds implicit multiplication', () => {
    expect(shown(run('2 ( 3'))).toBe('2 × (3');
    expect(result(run('2 pi ='))).toBeCloseTo(2 * Math.PI, 12);
    expect(result(run('( 2 ) ( 3 ) ='))).toBe(6);
  });
  it('supports exponent, right-associative', () => {
    expect(result(run('2 ^ 3 ^ 2 ='))).toBe(512);
    expect(result(run('2 ^ - 2 ='))).toBe(0.25);
  });
});

describe('input rules', () => {
  it('blocks leading zeros and a second decimal point', () => {
    expect(shown(run('0 0 7'))).toBe('7');
    expect(shown(run('1 . 2 . 3'))).toBe('1.23');
    expect(shown(run('.'))).toBe('0.');
  });
  it('replaces a repeated operator, but lets minus start a negative', () => {
    expect(shown(run('5 + *'))).toBe('5 × ');
    expect(shown(run('5 * -'))).toBe('5 × −');
    expect(result(run('5 * - 3 ='))).toBe(-15);
    expect(shown(run('5 * - +'))).toBe('5 + ');
  });
  it('limits a number to 15 digits', () => {
    expect(shown(run('1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7'))).toBe('12,34,56,78,90,12,345');
  });
  it('tidies a trailing decimal point', () => {
    expect(shown(run('5 . +'))).toBe('5 + ');
  });
  it('drops a trailing operator on =', () => {
    expect(result(run('5 + ='))).toBe(5);
  });
});

describe('percent (phone style)', () => {
  it('a + b% adds b percent of a', () => expect(result(run('2 0 0 + 1 0 pct ='))).toBe(220));
  it('a − b% subtracts b percent of a', () => expect(result(run('2 0 0 - 1 0 pct ='))).toBe(180));
  it('a × b% multiplies by b/100', () => expect(result(run('2 0 0 * 1 0 pct ='))).toBe(20));
  it('a ÷ b% divides by b/100', () => expect(result(run('5 0 / 2 5 pct ='))).toBe(200));
  it('b% alone is b/100', () => expect(result(run('5 0 pct ='))).toBe(0.5));
});

describe('sign, backspace, clear', () => {
  it('toggles the sign of the current number', () => {
    expect(shown(run('5 + 3 sign'))).toBe('5 + −3');
    expect(shown(run('5 + 3 sign sign'))).toBe('5 + 3');
    expect(result(run('sign 4 ='))).toBe(-4);
  });
  it('toggles the sign of a bracket group', () => {
    expect(result(run('( 2 + 3 ) sign ='))).toBe(-5);
  });
  it('flips a result directly', () => {
    expect(result(run('2 + 3 = sign ='))).toBe(-5);
  });
  it('backspace removes digits, then whole tokens', () => {
    expect(shown(run('1 2 3 back'))).toBe('12');
    expect(shown(run('2 + sin back'))).toBe('2 + ');
  });
  it('AC clears everything but keeps the angle mode', () => {
    const s = run('angle 2 + 3 ac');
    expect(s.tokens).toEqual([]);
    expect(s.angle).toBe('rad');
  });
});

describe('after a result', () => {
  it('repeats the last operation on =', () => {
    expect(result(run('2 + 3 = ='))).toBe(8);
    expect(result(run('2 * 3 = ='))).toBe(18);
  });
  it('a digit starts a new calculation', () => {
    expect(shown(run('2 + 3 = 7'))).toBe('7');
  });
  it('an operator continues from the result', () => {
    expect(result(run('2 + 3 = * 2 ='))).toBe(10);
  });
  it('a function wraps the result', () => {
    expect(result(run('5 * 5 = sqrt ='))).toBe(5);
  });
  it('records a history entry only on the press that produced it', () => {
    const s = run('2 + 3 =');
    expect(s.entry.value).toBe(5);
    expect(expressionText(s.entry.tokens)).toBe('2 + 3');
    expect(press(s, '4').entry).toBeNull();
  });
  it('loads a value from history as a result', () => {
    const s = loadValue(initialState(), 42);
    expect(result(run('+ 8 =', s))).toBe(50);
  });
});

describe('errors', () => {
  it('reports division by zero, and the next key starts fresh', () => {
    const s = run('5 / 0 =');
    expect(s.error).toBe('div0');
    expect(shown(press(s, '7'))).toBe('7');
  });
  it('backspace after an error returns to editing', () => {
    const s = press(run('5 / 0 ='), 'back');
    expect(s.error).toBeNull();
    expect(shown(s)).toBe('5 ÷ 0');
  });
  it('reports domain errors and overflow', () => {
    expect(run('sqrt sign 4 =').error).toBe('domain');
    expect(run('3 . 5 fact =').error).toBe('domain');
    expect(run('2 0 0 fact =').error).toBe('overflow');
    expect(run('0 inv =').error).toBe('div0');
  });
});

describe('scientific functions', () => {
  it('works in degrees by default with exact values', () => {
    expect(result(run('sin 3 0 ='))).toBe(0.5);
    expect(result(run('cos 9 0 ='))).toBe(0);
    expect(result(run('sin 1 8 0 ='))).toBe(0);
    expect(run('tan 9 0 =').error).toBe('domain');
  });
  it('works in radians', () => {
    expect(result(run('angle sin pi ='))).toBe(0);
    expect(result(run('angle cos pi ='))).toBe(-1);
  });
  it('supports ln, log, √, x², x!, 1/x', () => {
    expect(result(run('log 1 0 0 0 ='))).toBe(3);
    expect(result(run('ln e ='))).toBe(1);
    expect(result(run('sqrt 8 1 ='))).toBe(9);
    expect(result(run('1 2 sq ='))).toBe(144);
    expect(result(run('5 fact ='))).toBe(120);
    expect(result(run('4 inv ='))).toBe(0.25);
  });
  it('−2² is −4 (the minus applies after the power)', () => {
    expect(result(run('- 2 sq ='))).toBe(-4);
  });
});

describe('live preview', () => {
  it('shows the running result while typing', () => {
    expect(preview(run('2 + 3 *'))).toBe(5);
    expect(preview(run('2 + 3 * 4'))).toBe(14);
    expect(preview(run('( 2 + 3'))).toBe(5);
  });
  it('stays quiet for a bare number or an error', () => {
    expect(preview(run('4 2'))).toBeNull();
    expect(preview(run('5 / 0'))).toBeNull();
  });
});

describe('display of results', () => {
  it('formats big results in scientific notation', () => {
    expect(formatResult(result(run('9 9 9 9 9 9 9 9 9 * 9 9 9 9 9 9 9 9 9 ='))))
      .toBe('9.99999998×10¹⁷');
  });
});
