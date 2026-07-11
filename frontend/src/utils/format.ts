/**
 * Number, currency, and string formatting utilities. Pure and deterministic.
 */

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

/** Formats a numeric amount as a currency string (e.g. "$1,200"). */
export function formatCurrency(
  amount: number,
  options: { currency?: string; maximumFractionDigits?: number } = {},
): string {
  const { currency = DEFAULT_CURRENCY, maximumFractionDigits = 0 } = options;
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(amount);
}

/** Formats a number with locale-aware grouping (e.g. "12,340"). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value);
}

/** Abbreviates large numbers (e.g. 12300 -> "12.3K", 2_400_000 -> "2.4M"). */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, { notation: 'compact' }).format(value);
}

/** Returns uppercase initials from a name (e.g. "Ada Lovelace" -> "AL"). */
export function getInitials(name: string, maxLength = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxLength)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** Truncates text to `maxLength`, appending an ellipsis when it overflows. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Splits a full name into first and last parts: the first token is the first
 * name and the remainder is the last name (which the backend requires).
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = '', ...rest] = parts;
  return { firstName, lastName: rest.join(' ') };
}
