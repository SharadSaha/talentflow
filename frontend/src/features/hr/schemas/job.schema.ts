import { z } from 'zod';

import { EMPLOYMENT_TYPE, EXPERIENCE_LEVEL, SALARY_PERIOD, WORK_MODE } from '@/constants/job';
import type {
  CreateJobRequest,
  JobSkillInput,
  UpdateJobRequest,
} from '@/features/hr/types/hr-job.types';
import type { Job } from '@/types/job';

const TITLE_MAX = 150;
const DESCRIPTION_MAX = 10000;
const LOCATION_MAX = 120;
const MAX_SALARY = 1_000_000_000;
const MAX_EXPERIENCE_YEARS = 60;
const MAX_OPENINGS = 10_000;
const DEFAULT_CURRENCY = 'USD';

/** A non-negative integer field, `undefined` when the input is left blank. */
function optionalInt(label: string, max: number) {
  return z
    .number({ error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(0, `${label} cannot be negative.`)
    .max(max, `${label} must be at most ${max.toLocaleString()}.`)
    .optional();
}

const skillSchema = z.object({
  slug: z.string().min(1),
  isRequired: z.boolean(),
});

export const jobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Job title is required.')
      .max(TITLE_MAX, `Title must be at most ${TITLE_MAX} characters.`),
    description: z
      .string()
      .trim()
      .min(1, 'Description is required.')
      .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters.`),
    employmentType: z.enum(EMPLOYMENT_TYPE),
    experienceLevel: z.enum(EXPERIENCE_LEVEL),
    workMode: z.enum(WORK_MODE),
    location: z
      .string()
      .trim()
      .max(LOCATION_MAX, `Location must be at most ${LOCATION_MAX} characters.`),
    minExperienceYears: optionalInt('Minimum experience', MAX_EXPERIENCE_YEARS),
    maxExperienceYears: optionalInt('Maximum experience', MAX_EXPERIENCE_YEARS),
    salaryMin: optionalInt('Minimum salary', MAX_SALARY),
    salaryMax: optionalInt('Maximum salary', MAX_SALARY),
    salaryPeriod: z.enum(SALARY_PERIOD),
    openings: z
      .number({ error: 'Openings must be a number.' })
      .int('Openings must be a whole number.')
      .min(1, 'There must be at least one opening.')
      .max(MAX_OPENINGS, `Openings must be at most ${MAX_OPENINGS.toLocaleString()}.`),
    skills: z.array(skillSchema).max(50, 'A job can list at most 50 skills.'),
  })
  .refine(
    (v) =>
      v.minExperienceYears === undefined ||
      v.maxExperienceYears === undefined ||
      v.minExperienceYears <= v.maxExperienceYears,
    { message: 'Minimum experience cannot exceed the maximum.', path: ['minExperienceYears'] },
  )
  .refine(
    (v) => v.salaryMin === undefined || v.salaryMax === undefined || v.salaryMin <= v.salaryMax,
    { message: 'Minimum salary cannot exceed the maximum.', path: ['salaryMin'] },
  );

export type JobFormValues = z.infer<typeof jobSchema>;

/** Blank defaults for creating a job. */
export const EMPTY_JOB_FORM_VALUES: JobFormValues = {
  title: '',
  description: '',
  employmentType: EMPLOYMENT_TYPE.FULL_TIME,
  experienceLevel: EXPERIENCE_LEVEL.MID_LEVEL,
  workMode: WORK_MODE.ONSITE,
  location: '',
  minExperienceYears: undefined,
  maxExperienceYears: undefined,
  salaryMin: undefined,
  salaryMax: undefined,
  salaryPeriod: SALARY_PERIOD.YEARLY,
  openings: 1,
  skills: [],
};

/** Maps an existing job into form values for the edit flow. */
export function jobToFormValues(job: Job): JobFormValues {
  return {
    title: job.title,
    description: job.description,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    workMode: job.workMode,
    location: job.location ?? '',
    minExperienceYears: job.minExperienceYears ?? undefined,
    maxExperienceYears: job.maxExperienceYears ?? undefined,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryPeriod: job.salaryPeriod,
    openings: job.openings,
    skills: job.skills.map((skill) => ({ slug: skill.slug, isRequired: skill.isRequired })),
  };
}

/** Trims and omits empty optional fields common to create/update payloads. */
function toJobPayloadBase(values: JobFormValues) {
  const location = values.location.trim();
  const skills: JobSkillInput[] = values.skills.map((skill) => ({
    slug: skill.slug,
    isRequired: skill.isRequired,
  }));
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    employmentType: values.employmentType,
    experienceLevel: values.experienceLevel,
    workMode: values.workMode,
    ...(location ? { location } : {}),
    ...(values.minExperienceYears !== undefined
      ? { minExperienceYears: values.minExperienceYears }
      : {}),
    ...(values.maxExperienceYears !== undefined
      ? { maxExperienceYears: values.maxExperienceYears }
      : {}),
    ...(values.salaryMin !== undefined ? { salaryMin: values.salaryMin } : {}),
    ...(values.salaryMax !== undefined ? { salaryMax: values.salaryMax } : {}),
    salaryCurrency: DEFAULT_CURRENCY,
    salaryPeriod: values.salaryPeriod,
    openings: values.openings,
    skills,
  };
}

/** Builds a create payload with the chosen publish state. */
export function toCreateJobRequest(
  values: JobFormValues,
  status: 'DRAFT' | 'PUBLISHED',
): CreateJobRequest {
  return { ...toJobPayloadBase(values), status };
}

/** Builds an update payload (status preserved unless explicitly changed). */
export function toUpdateJobRequest(
  values: JobFormValues,
  status?: 'DRAFT' | 'PUBLISHED',
): UpdateJobRequest {
  return { ...toJobPayloadBase(values), ...(status ? { status } : {}) };
}
