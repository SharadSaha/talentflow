import { describe, expect, it } from 'vitest';

import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  getInitials,
  splitFullName,
  truncate,
} from '@/utils/format';

describe('formatCurrency', () => {
  it('formats an amount as USD without fractional digits by default', () => {
    expect(formatCurrency(1200)).toBe('$1,200');
  });

  it('honours a custom currency', () => {
    expect(formatCurrency(1000, { currency: 'EUR' })).toBe('€1,000');
  });

  it('rounds to the requested fractional digits', () => {
    expect(formatCurrency(1200.567, { maximumFractionDigits: 2 })).toBe('$1,200.57');
  });
});

describe('formatNumber', () => {
  it('adds locale-aware grouping separators', () => {
    expect(formatNumber(12340)).toBe('12,340');
  });
});

describe('formatCompactNumber', () => {
  it('abbreviates thousands', () => {
    expect(formatCompactNumber(12300)).toBe('12K');
  });

  it('abbreviates millions', () => {
    expect(formatCompactNumber(2_400_000)).toBe('2.4M');
  });
});

describe('getInitials', () => {
  it('returns uppercase initials from the first two name parts', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
  });

  it('caps the number of initials at the requested maximum', () => {
    expect(getInitials('Grace Brewster Murray Hopper', 3)).toBe('GBM');
  });

  it('collapses extra whitespace between name parts', () => {
    expect(getInitials('  Ada   Lovelace  ')).toBe('AL');
  });

  it('returns an empty string for a blank name', () => {
    expect(getInitials('   ')).toBe('');
  });
});

describe('truncate', () => {
  it('leaves text within the limit unchanged', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('appends an ellipsis when the text overflows', () => {
    expect(truncate('Hello world', 5)).toBe('Hello…');
  });

  it('trims trailing whitespace before the ellipsis', () => {
    expect(truncate('Hello     world', 6)).toBe('Hello…');
  });
});

describe('splitFullName', () => {
  it('uses the first token as the first name and the rest as the last name', () => {
    expect(splitFullName('Ada Lovelace')).toEqual({ firstName: 'Ada', lastName: 'Lovelace' });
  });

  it('groups all trailing tokens into the last name', () => {
    expect(splitFullName('Grace Brewster Hopper')).toEqual({
      firstName: 'Grace',
      lastName: 'Brewster Hopper',
    });
  });

  it('returns an empty last name when only one token is given', () => {
    expect(splitFullName('Ada')).toEqual({ firstName: 'Ada', lastName: '' });
  });

  it('returns empty parts for a blank input', () => {
    expect(splitFullName('   ')).toEqual({ firstName: '', lastName: '' });
  });
});
