import { z } from 'zod';

import {
  ABOUT_MAX_LENGTH,
  COMPANY_MAX_LENGTH,
  HEADLINE_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  MAX_EXPERIENCE_MONTHS,
  MAX_NOTICE_PERIOD_DAYS,
  PHONE_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  URL_MAX_LENGTH,
} from '@/constants/validation';
import { EducationLevel } from '@/generated/prisma/enums';

const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalNonNegativeInt = (max?: number) => {
  const base = z.number().int().min(0);
  return (max === undefined ? base : base.max(max)).optional();
};

/**
 * Validation schema for `PATCH /api/v1/profile`.
 *
 * `.strict()` rejects unknown keys, which blocks mass assignment of fields such
 * as `role` or `userId`. Every field is optional, but at least one must be
 * supplied, and the salary range must be internally consistent.
 */
export const updateProfileSchema = z.object({
  body: z
    .object({
      headline: optionalText(HEADLINE_MAX_LENGTH),
      about: optionalText(ABOUT_MAX_LENGTH),
      phone: optionalText(PHONE_MAX_LENGTH),
      currentLocation: optionalText(LOCATION_MAX_LENGTH),
      preferredLocation: optionalText(LOCATION_MAX_LENGTH),
      currentCompany: optionalText(COMPANY_MAX_LENGTH),
      currentTitle: optionalText(TITLE_MAX_LENGTH),
      totalExperienceMonths: optionalNonNegativeInt(MAX_EXPERIENCE_MONTHS),
      highestEducation: z.enum(EducationLevel).optional(),
      expectedSalaryMin: optionalNonNegativeInt(),
      expectedSalaryMax: optionalNonNegativeInt(),
      noticePeriodDays: optionalNonNegativeInt(MAX_NOTICE_PERIOD_DAYS),
      isOpenToWork: z.boolean().optional(),
      resumeUrl: z.string().trim().url().max(URL_MAX_LENGTH).optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field must be provided to update the profile.',
    })
    .refine(
      (value) =>
        value.expectedSalaryMin === undefined ||
        value.expectedSalaryMax === undefined ||
        value.expectedSalaryMin <= value.expectedSalaryMax,
      {
        message: 'expectedSalaryMin cannot be greater than expectedSalaryMax.',
        path: ['expectedSalaryMin'],
      },
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
