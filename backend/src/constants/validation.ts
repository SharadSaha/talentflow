/**
 * Validation limits and patterns shared by Zod schemas. Keeping them here avoids
 * duplicating magic numbers/regex across feature validators.
 */

export const PASSWORD_MIN_LENGTH = 8;

/**
 * bcrypt only considers the first 72 bytes of a password; rejecting longer
 * inputs avoids silently ignoring characters.
 */
export const PASSWORD_MAX_LENGTH = 72;

/**
 * At least one lowercase letter, one uppercase letter, one digit, and one
 * special character.
 */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';

export const NAME_MAX_LENGTH = 100;
export const HEADLINE_MAX_LENGTH = 160;
export const ABOUT_MAX_LENGTH = 2000;
export const PHONE_MAX_LENGTH = 20;
export const LOCATION_MAX_LENGTH = 120;
export const COMPANY_MAX_LENGTH = 120;
export const TITLE_MAX_LENGTH = 120;
export const URL_MAX_LENGTH = 2000;

/** 60 years expressed in months — a generous upper bound for total experience. */
export const MAX_EXPERIENCE_MONTHS = 720;

/** One year expressed in days — a generous upper bound for a notice period. */
export const MAX_NOTICE_PERIOD_DAYS = 365;
