import { z } from 'zod';

import {
  csvStringArraySchema,
  paginationQuerySchema,
  sortQuerySchema,
  uuidSchema,
} from '@/common/query.schemas';
import { DEFAULT_JOB_SORT_FIELD, JOB_SORT_FIELDS } from '@/constants/query';
import {
  COMPANY_MAX_LENGTH,
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  MAX_EXPERIENCE_YEARS,
  MAX_OPENINGS,
  MAX_SALARY,
  SEARCH_TERM_MAX_LENGTH,
} from '@/constants/validation';
import {
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  LocationType,
  SalaryPeriod,
} from '@/generated/prisma/enums';

const skillInputSchema = z.object({
  slug: z.string().trim().min(1).max(COMPANY_MAX_LENGTH),
  isRequired: z.boolean().default(true),
});

const salaryRangeIsValid = (value: { salaryMin?: number; salaryMax?: number }): boolean =>
  value.salaryMin === undefined ||
  value.salaryMax === undefined ||
  value.salaryMin <= value.salaryMax;

const experienceRangeIsValid = (value: {
  minExperienceYears?: number;
  maxExperienceYears?: number;
}): boolean =>
  value.minExperienceYears === undefined ||
  value.maxExperienceYears === undefined ||
  value.minExperienceYears <= value.maxExperienceYears;

const SALARY_RANGE_MESSAGE = {
  message: 'salaryMin cannot be greater than salaryMax.',
  path: ['salaryMin'],
};
const EXPERIENCE_RANGE_MESSAGE = {
  message: 'minExperienceYears cannot be greater than maxExperienceYears.',
  path: ['minExperienceYears'],
};

const jobBodyShape = {
  title: z.string().trim().min(1).max(JOB_TITLE_MAX_LENGTH),
  description: z.string().trim().min(1).max(JOB_DESCRIPTION_MAX_LENGTH),
  employmentType: z.enum(EmploymentType),
  experienceLevel: z.enum(ExperienceLevel),
  workMode: z.enum(LocationType).default(LocationType.ONSITE),
  location: z.string().trim().max(LOCATION_MAX_LENGTH).optional(),
  minExperienceYears: z.number().int().min(0).max(MAX_EXPERIENCE_YEARS).optional(),
  maxExperienceYears: z.number().int().min(0).max(MAX_EXPERIENCE_YEARS).optional(),
  salaryMin: z.number().int().min(0).max(MAX_SALARY).optional(),
  salaryMax: z.number().int().min(0).max(MAX_SALARY).optional(),
  salaryCurrency: z.string().trim().toUpperCase().length(3).optional(),
  salaryPeriod: z.enum(SalaryPeriod).default(SalaryPeriod.YEARLY),
  openings: z.number().int().min(1).max(MAX_OPENINGS).default(1),
  skills: z.array(skillInputSchema).max(50).default([]),
};

/** Validation schema for `POST /jobs`. New jobs default to PUBLISHED. */
export const createJobSchema = z.object({
  body: z
    .object({
      ...jobBodyShape,
      status: z.enum([JobStatus.DRAFT, JobStatus.PUBLISHED]).default(JobStatus.PUBLISHED),
    })
    .strict()
    .refine(salaryRangeIsValid, SALARY_RANGE_MESSAGE)
    .refine(experienceRangeIsValid, EXPERIENCE_RANGE_MESSAGE),
});

/** Validation schema for `PATCH /jobs/:id`. All fields optional; at least one required. */
export const updateJobSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z
    .object({
      title: jobBodyShape.title.optional(),
      description: jobBodyShape.description.optional(),
      employmentType: z.enum(EmploymentType).optional(),
      experienceLevel: z.enum(ExperienceLevel).optional(),
      workMode: z.enum(LocationType).optional(),
      location: z.string().trim().max(LOCATION_MAX_LENGTH).optional(),
      minExperienceYears: z.number().int().min(0).max(MAX_EXPERIENCE_YEARS).optional(),
      maxExperienceYears: z.number().int().min(0).max(MAX_EXPERIENCE_YEARS).optional(),
      salaryMin: z.number().int().min(0).max(MAX_SALARY).optional(),
      salaryMax: z.number().int().min(0).max(MAX_SALARY).optional(),
      salaryCurrency: z.string().trim().toUpperCase().length(3).optional(),
      salaryPeriod: z.enum(SalaryPeriod).optional(),
      openings: z.number().int().min(1).max(MAX_OPENINGS).optional(),
      status: z.enum([JobStatus.DRAFT, JobStatus.PUBLISHED, JobStatus.CLOSED]).optional(),
      skills: z.array(skillInputSchema).max(50).optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field must be provided to update the job.',
    })
    .refine(salaryRangeIsValid, SALARY_RANGE_MESSAGE)
    .refine(experienceRangeIsValid, EXPERIENCE_RANGE_MESSAGE),
});

const jobListQueryShape = {
  ...paginationQuerySchema.shape,
  ...sortQuerySchema(JOB_SORT_FIELDS, DEFAULT_JOB_SORT_FIELD).shape,
  keyword: z.string().trim().max(SEARCH_TERM_MAX_LENGTH).optional(),
  location: z.string().trim().max(LOCATION_MAX_LENGTH).optional(),
  employmentType: z.enum(EmploymentType).optional(),
  experienceLevel: z.enum(ExperienceLevel).optional(),
  workMode: z.enum(LocationType).optional(),
  salaryMin: z.coerce.number().int().min(0).max(MAX_SALARY).optional(),
  salaryMax: z.coerce.number().int().min(0).max(MAX_SALARY).optional(),
  skills: csvStringArraySchema,
  status: z.enum(JobStatus).optional(),
  company: z.string().trim().max(COMPANY_MAX_LENGTH).optional(),
};

/** Validation schema for the query string of `GET /jobs` and `GET /hr/jobs`. */
export const jobListQuerySchema = z.object({
  query: z.object(jobListQueryShape),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];
export type JobListQueryInput = z.infer<typeof jobListQuerySchema>['query'];
