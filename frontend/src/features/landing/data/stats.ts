export interface StatItem {
  /** Numeric target for the count-up animation. */
  value: number;
  /** Prefix rendered before the number (e.g. a currency symbol). */
  prefix?: string;
  /** Suffix rendered after the number (e.g. 'K', 'M', '%', '+'). */
  suffix?: string;
  label: string;
}

/** Headline metrics animated as counters when scrolled into view. */
export const STATS: StatItem[] = [
  { value: 12, suffix: 'K+', label: 'Jobs posted' },
  { value: 480, suffix: 'K+', label: 'Candidates' },
  { value: 2, suffix: 'M+', label: 'Applications processed' },
  { value: 98, suffix: '%', label: 'Hiring success rate' },
];
