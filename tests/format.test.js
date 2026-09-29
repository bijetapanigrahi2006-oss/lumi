import { describe, it, expect } from 'vitest';
import { groupIndian, formatTyped, formatResult, toParts } from '../src/engine/format.js';

describe('Indian grouping', () => {
  it('groups lakh and crore', () => {
    expect(groupIndian('123')).toBe('123');
    expect(groupIndian('1234')).toBe('1,234');
    expect(groupIndian('100000')).toBe('1,00,000');
    expect(groupIndian('1234567')).toBe('12,34,567');
    expect(groupIndian('123456789')).toBe('12,34,56,789');
  });
});

describe('formatTyped', () => {
  it('keeps what the user typed', () => {
    expect(formatTyped('1234567.50')).toBe('12,34,567.50');
    expect(formatTyped('12.')).toBe('12.');
    expect(formatTyped('0.')).toBe('0.');
  });
});

describe('formatResult', () => {
  it('formats plain numbers', () => {
    expect(formatResult(0)).toBe('0');
    expect(formatResult(-0)).toBe('0');
    expect(formatResult(1234567.89)).toBe('12,34,567.89');
    expect(formatResult(-5)).toBe('−5');
  });
  it('limits fractions to 12 significant digits', () => {
    expect(formatResult(1 / 3)).toBe('0.333333333333');
    expect(formatResult(2 / 3)).toBe('0.666666666667');
  });
  it('shows every digit of a whole number up to 15 digits', () => {
    expect(formatResult(123456789012345)).toBe('12,34,56,78,90,12,345');
  });
  it('shows small numbers without an exponent down to 1e-9', () => {
    expect(formatResult(0.0000001234)).toBe('0.0000001234');
  });
  it('uses scientific notation for huge and tiny numbers', () => {
    expect(formatResult(1.5e18)).toBe('1.5×10¹⁸');
    expect(formatResult(-2e-12)).toBe('−2×10⁻¹²');
    expect(toParts(1e21)).toEqual({ neg: false, int: '1', frac: '', exp: 21 });
  });
});
