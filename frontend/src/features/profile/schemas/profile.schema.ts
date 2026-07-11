import { z } from 'zod';

import { EDUCATION_LEVEL } from '@/constants/education';

/**
 * Validation schema for the editable candidate-profile fields, mirroring the
 * backend `PATCH /profile` whitelist. Text fields may be empty; number fields
 * are coerced from their string inputs and treated as `undefined` when blank.
 * The server remains the source of truth — these rules just fail fast in the UI.
 */

const HEADLINE_MAX = 160;
const ABOUT_MAX = 2000;
const PHONE_MAX = 20;
const LOCATION_MAX = 120;
const COMPANY_MAX = 120;
const TITLE_MAX = 120;
const RESUME_URL_MAX = 2000;
const EXPERIENCE_MONTHS_MAX = 720;
const NOTICE_PERIOD_MAX = 365;

/** A bounded, trimmed text field that is allowed to be empty. */
function optionalText(max: number, label: string) {
  return z.string().trim().max(max, `${label} must be at most ${max} characters.`);
}

/**
 * A non-negative integer field that is `undefined` when left blank. Inputs
 * hand this schema a `number | undefined` (empty maps to `undefined` at the
 * field boundary), so no string coercion is required.
 */
function optionalInt(label: string, bounds: { max?: number } = {}) {
  let number = z
    .number({ error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(0, `${label} cannot be negative.`);

  if (bounds.max !== undefined) {
    number = number.max(bounds.max, `${label} must be at most ${bounds.max}.`);
  }

  return number.optional();
}

export const profileSchema = z
  .object({
    headline: optionalText(HEADLINE_MAX, 'Headline'),
    about: optionalText(ABOUT_MAX, 'About'),
    phone: optionalText(PHONE_MAX, 'Phone'),
    currentLocation: optionalText(LOCATION_MAX, 'Current location'),
    preferredLocation: optionalText(LOCATION_MAX, 'Preferred location'),
    currentCompany: optionalText(COMPANY_MAX, 'Current company'),
    currentTitle: optionalText(TITLE_MAX, 'Current title'),
    totalExperienceMonths: optionalInt('Experience', { max: EXPERIENCE_MONTHS_MAX }),
    highestEducation: z.enum(EDUCATION_LEVEL).optional(),
    expectedSalaryMin: optionalInt('Expected minimum salary'),
    expectedSalaryMax: optionalInt('Expected maximum salary'),
    noticePeriodDays: optionalInt('Notice period', { max: NOTICE_PERIOD_MAX }),
    isOpenToWork: z.boolean(),
    resumeUrl: z
      .string()
      .trim()
      .max(RESUME_URL_MAX, `Resume URL must be at most ${RESUME_URL_MAX} characters.`)
      .refine(
        (value) => value === '' || z.string().url().safeParse(value).success,
        'Enter a valid URL (starting with http:// or https://).',
      ),
  })
  .refine(
    (values) =>
      values.expectedSalaryMin === undefined ||
      values.expectedSalaryMax === undefined ||
      values.expectedSalaryMin <= values.expectedSalaryMax,
    {
      message: 'Minimum salary must be less than or equal to the maximum.',
      path: ['expectedSalaryMin'],
    },
  );

export type ProfileFormValues = z.infer<typeof profileSchema>;
