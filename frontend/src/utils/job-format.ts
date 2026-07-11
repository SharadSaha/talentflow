import { type SalaryPeriod, SALARY_PERIOD_SUFFIX } from '@/constants/job';

/**
 * Job-specific formatting helpers (salary ranges, experience ranges). Pure and
 * deterministic; used across job cards, details, and applications.
 */

function formatCompactCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: amount >= 1000 ? 0 : 1,
  }).format(amount);
}

/**
 * Formats a salary range into a compact, human string (e.g. "$80K – $120K/yr").
 * Returns `null` when no salary information is available, so callers can hide
 * the field entirely.
 */
export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string,
  period: SalaryPeriod,
): string | null {
  if (min === null && max === null) return null;

  const suffix = SALARY_PERIOD_SUFFIX[period];
  const safeCurrency = currency || 'USD';

  if (min !== null && max !== null) {
    return `${formatCompactCurrency(min, safeCurrency)} – ${formatCompactCurrency(max, safeCurrency)}${suffix}`;
  }
  if (min !== null) {
    return `From ${formatCompactCurrency(min, safeCurrency)}${suffix}`;
  }
  return `Up to ${formatCompactCurrency(max as number, safeCurrency)}${suffix}`;
}

/** Formats a required-experience range in years (e.g. "3–5 yrs", "5+ yrs"). */
export function formatExperienceRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    return min === max ? `${min} yrs` : `${min}–${max} yrs`;
  }
  if (min !== null) return `${min}+ yrs`;
  return `Up to ${max} yrs`;
}

/** Formats a total-experience figure in months into "Xy Ym" (e.g. "4y 2m"). */
export function formatExperienceMonths(totalMonths: number): string {
  if (totalMonths <= 0) return 'No experience';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  return parts.join(' ');
}
