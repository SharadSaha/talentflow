import { z } from 'zod';

/**
 * Validation for the HR organization form. The company name is required; the
 * website is an optional URL, and the description is a bounded free-text field.
 */

const NAME_MIN = 2;
const NAME_MAX = 120;
const WEBSITE_MAX = 2000;
const DESCRIPTION_MAX = 2000;

export const organizationSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(NAME_MIN, `Company name must be at least ${NAME_MIN} characters.`)
    .max(NAME_MAX, `Company name must be at most ${NAME_MAX} characters.`),
  website: z
    .string()
    .trim()
    .max(WEBSITE_MAX, `Website must be at most ${WEBSITE_MAX} characters.`)
    .refine(
      (value) => value === '' || z.string().url().safeParse(value).success,
      'Enter a valid URL (starting with http:// or https://).',
    ),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters.`),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
