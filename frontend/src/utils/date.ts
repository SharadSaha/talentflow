/**
 * Date formatting utilities. Pure and deterministic given a fixed locale;
 * built on the native `Intl` API to avoid a date-library dependency.
 */

const DEFAULT_LOCALE = 'en-US';

type DateInput = Date | string | number;

/** Coerces supported inputs to a `Date`, returning `null` when invalid. */
function toDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a date as an absolute, human-readable string (e.g. "Jul 11, 2026"). */
export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  const date = toDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(date);
}

/** Formats a date including the time of day (e.g. "Jul 11, 2026, 3:45 PM"). */
export function formatDateTime(value: DateInput): string {
  return formatDate(value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: 'day', ms: 1000 * 60 * 60 * 24 },
  { unit: 'hour', ms: 1000 * 60 * 60 },
  { unit: 'minute', ms: 1000 * 60 },
  { unit: 'second', ms: 1000 },
];

/**
 * Formats a date relative to now (e.g. "3 days ago", "in 2 hours"). Picks the
 * largest sensible unit. `now` is injectable to keep the function deterministic
 * in tests.
 */
export function formatRelativeTime(value: DateInput, now: DateInput = new Date()): string {
  const date = toDate(value);
  const reference = toDate(now);
  if (!date || !reference) return '';

  const diffMs = date.getTime() - reference.getTime();
  const formatter = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });

  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (Math.abs(diffMs) >= ms || unit === 'second') {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }

  return formatter.format(0, 'second');
}
