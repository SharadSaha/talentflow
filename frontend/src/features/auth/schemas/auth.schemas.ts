import { z } from 'zod';

import { emailField, NAME_MAX_LENGTH, passwordField } from '@/utils/validation';

/**
 * Client-side validation schemas for the auth forms. Field rules mirror the
 * backend so the UI fails fast with matching messages; the server remains the
 * source of truth. Reuses shared field builders to avoid duplicating rules.
 */

/** Bounds for the employer organization name (mirrors the backend). */
export const ORGANIZATION_NAME_MIN_LENGTH = 2;
export const ORGANIZATION_NAME_MAX_LENGTH = 120;

/** Login: password is only required (strength is enforced at registration). */
export const loginSchema = z.object({
  email: emailField,
  password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Shared registration fields for both candidate and employer flows. Kept as a
 * plain object schema (not refined) so it can be extended before the
 * cross-field password-match check is applied.
 */
const registerBaseObject = z.object({
  fullName: z
    .string({ error: 'Full name is required.' })
    .trim()
    .min(1, 'Full name is required.')
    .max(NAME_MAX_LENGTH * 2, 'Full name is too long.')
    .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, {
      message: 'Enter your first and last name.',
    }),
  email: emailField,
  password: passwordField,
  confirmPassword: z.string({ error: 'Please confirm your password.' }),
});

/** Cross-field rule: the confirmation must match the password. */
const passwordsMatch = (values: { password: string; confirmPassword: string }): boolean =>
  values.password === values.confirmPassword;

const PASSWORD_MISMATCH_ISSUE = {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
};

/**
 * Candidate registration. A single full-name field must contain a first and
 * last name (the backend requires both); the confirm field must match.
 */
export const registerSchema = registerBaseObject.refine(passwordsMatch, PASSWORD_MISMATCH_ISSUE);

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Required, length-bounded employer organization name. */
export const organizationNameField = z
  .string({ error: 'Organization name is required.' })
  .trim()
  .min(1, 'Organization name is required.')
  .min(
    ORGANIZATION_NAME_MIN_LENGTH,
    `Organization name must be at least ${ORGANIZATION_NAME_MIN_LENGTH} characters.`,
  )
  .max(
    ORGANIZATION_NAME_MAX_LENGTH,
    `Organization name must be at most ${ORGANIZATION_NAME_MAX_LENGTH} characters.`,
  );

/**
 * Employer (HR) registration. Extends the candidate fields with a mandatory
 * organization name that identifies the hiring workspace.
 */
export const hrRegisterSchema = registerBaseObject
  .extend({ organizationName: organizationNameField })
  .refine(passwordsMatch, PASSWORD_MISMATCH_ISSUE);

export type HrRegisterFormValues = z.infer<typeof hrRegisterSchema>;
