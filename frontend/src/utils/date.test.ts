import { describe, expect, it } from 'vitest';

import { formatDate, formatRelativeTime } from '@/utils/date';

describe('formatDate', () => {
  it('formats an ISO date as an absolute string', () => {
    expect(formatDate('2026-07-11T00:00:00.000Z')).toBe('Jul 11, 2026');
  });

  it('returns an empty string for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-11T12:00:00.000Z');

  it('formats a past time using the largest sensible unit', () => {
    const threeDaysAgo = new Date('2026-07-08T12:00:00.000Z');
    expect(formatRelativeTime(threeDaysAgo, now)).toBe('3 days ago');
  });

  it('formats a future time', () => {
    const inTwoHours = new Date('2026-07-11T14:00:00.000Z');
    expect(formatRelativeTime(inTwoHours, now)).toBe('in 2 hours');
  });

  it('returns an empty string for invalid input', () => {
    expect(formatRelativeTime('invalid', now)).toBe('');
  });
});
