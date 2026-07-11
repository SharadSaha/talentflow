/**
 * Reusable validation predicates and Zod field builders shared across form
 * schemas. Mirrors the backend validation rules so the client fails fast with
 * matching messages (the server remains the source of truth).
 */
import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const NAME_MAX_LENGTH = 100;

/** At least one lowercase, one uppercase, one digit, and one special character. */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';

/** Reusable email field: trimmed, lowercased, validated. */
export const emailField = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.');

/** Reusable strong-password field matching the backend policy. */
export const passwordField = z
  .string({ error: 'Password is required.' })
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`)
  .regex(PASSWORD_PATTERN, PASSWORD_REQUIREMENTS_MESSAGE);

/** Reusable required, length-bounded name field builder. */
export function nameField(label: string, maxLength = 100) {
  return z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be at most ${maxLength} characters.`);
}

/** Whether a string is a non-empty value after trimming. */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
