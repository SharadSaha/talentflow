import { describe, expect, it } from 'vitest';

import { SALARY_PERIOD } from '@/constants/job';
import {
  formatExperienceMonths,
  formatExperienceRange,
  formatSalaryRange,
} from '@/utils/job-format';

describe('formatSalaryRange', () => {
  it('returns null when neither bound is provided', () => {
    expect(formatSalaryRange(null, null, 'USD', SALARY_PERIOD.YEARLY)).toBeNull();
  });

  it('formats a full range with a period suffix', () => {
    expect(formatSalaryRange(80000, 120000, 'USD', SALARY_PERIOD.YEARLY)).toBe('$80K – $120K/yr');
  });

  it('prefixes with "From" when only a minimum is given', () => {
    expect(formatSalaryRange(80000, null, 'USD', SALARY_PERIOD.MONTHLY)).toBe('From $80K/mo');
  });

  it('prefixes with "Up to" when only a maximum is given', () => {
    expect(formatSalaryRange(null, 120000, 'USD', SALARY_PERIOD.HOURLY)).toBe('Up to $120K/hr');
  });

  it('falls back to USD when the currency is an empty string', () => {
    expect(formatSalaryRange(80000, null, '', SALARY_PERIOD.YEARLY)).toBe('From $80K/yr');
  });
});

describe('formatExperienceRange', () => {
  it('returns null when neither bound is provided', () => {
    expect(formatExperienceRange(null, null)).toBeNull();
  });

  it('formats a distinct min-max range', () => {
    expect(formatExperienceRange(3, 5)).toBe('3–5 yrs');
  });

  it('collapses an equal min and max into a single figure', () => {
    expect(formatExperienceRange(5, 5)).toBe('5 yrs');
  });

  it('appends a plus sign when only a minimum is given', () => {
    expect(formatExperienceRange(5, null)).toBe('5+ yrs');
  });

  it('prefixes with "Up to" when only a maximum is given', () => {
    expect(formatExperienceRange(null, 5)).toBe('Up to 5 yrs');
  });
});

describe('formatExperienceMonths', () => {
  it('reports no experience for zero or negative months', () => {
    expect(formatExperienceMonths(0)).toBe('No experience');
    expect(formatExperienceMonths(-4)).toBe('No experience');
  });

  it('formats whole years without a months segment', () => {
    expect(formatExperienceMonths(24)).toBe('2y');
  });

  it('formats a combined years and months figure', () => {
    expect(formatExperienceMonths(74)).toBe('6y 2m');
  });

  it('formats a months-only figure under one year', () => {
    expect(formatExperienceMonths(5)).toBe('5m');
  });
});
