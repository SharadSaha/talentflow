import { z } from 'zod';

import { emailField, NAME_MAX_LENGTH, passwordField } from '@/utils/validation';

/**
 * Client-side validation schemas for the auth forms. Field rules mirror the
 * backend so the UI fails fast with matching messages; the server remains the
 * source of truth. Reuses shared field builders to avoid duplicating rules.
 */

/** Login: password is only required (strength is enforced at registration). */
export const loginSchema = z.object({
  email: emailField,
  password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Candidate registration. A single full-name field must contain a first and
 * last name (the backend requires both); the confirm field must match.
 */
export const registerSchema = z
  .object({
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
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
