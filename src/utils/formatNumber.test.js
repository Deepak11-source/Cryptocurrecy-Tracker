import { describe, it, expect } from 'vitest';
import formatNumber from './formatNumber';

describe('formatNumber', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('accepts numeric strings', () => {
    expect(formatNumber('1234567.89')).toBe(
      '1234567.89'.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    );
  });

  it('returns "Invalid Number" for non-numeric input', () => {
    expect(formatNumber('not-a-number')).toBe('Invalid Number');
  });

  it('returns "Invalid Number" for undefined', () => {
    expect(formatNumber(undefined)).toBe('Invalid Number');
  });
});
