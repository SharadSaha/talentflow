import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names conditionally (`clsx`) and resolves conflicting Tailwind
 * utilities (`tailwind-merge`). Used by every UI component for className props.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
