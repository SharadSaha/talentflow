import { z } from 'zod';

import {
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from '@/constants/validation';

const emailSchema = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .email('A valid email address is required.');

const nameSchema = (label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(NAME_MAX_LENGTH, `${label} must be at most ${NAME_MAX_LENGTH} characters.`);

/** Validation schema for `POST /auth/register`. */
export const registerSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      password: z
        .string({ error: 'Password is required.' })
        .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
        .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`)
        .regex(PASSWORD_PATTERN, PASSWORD_REQUIREMENTS_MESSAGE),
      firstName: nameSchema('First name'),
      lastName: nameSchema('Last name'),
    })
    .strict(),
});

/** Validation schema for `POST /auth/login`. */
export const loginSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
    })
    .strict(),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
