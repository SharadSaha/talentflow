import { z } from 'zod';

import {
  csvStringArraySchema,
  paginationQuerySchema,
  sortQuerySchema,
  uuidSchema,
} from '@/common/query.schemas';
import {
  APPLICANT_SORT_FIELDS,
  APPLICATION_SORT_FIELDS,
  DEFAULT_APPLICANT_SORT_FIELD,
  DEFAULT_APPLICATION_SORT_FIELD,
} from '@/constants/query';
import {
  COMPANY_MAX_LENGTH,
  COVER_LETTER_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  MAX_EXPERIENCE_MONTHS,
  SEARCH_TERM_MAX_LENGTH,
  STATUS_NOTE_MAX_LENGTH,
  URL_MAX_LENGTH,
} from '@/constants/validation';
import { ApplicationStatus, EducationLevel } from '@/generated/prisma/enums';

import { HR_SETTABLE_STATUSES } from './application.status';

/** Validation schema for `POST /applications`. */
export const applySchema = z.object({
  body: z
    .object({
      jobId: uuidSchema,
      coverLetter: z.string().trim().max(COVER_LETTER_MAX_LENGTH).optional(),
      resumeUrl: z.string().trim().url().max(URL_MAX_LENGTH).optional(),
    })
    .strict(),
});

/** Validation schema for the query string of `GET /applications/me`. */
export const myApplicationsQuerySchema = z.object({
  query: z.object({
    ...paginationQuerySchema.shape,
    ...sortQuerySchema(APPLICATION_SORT_FIELDS, DEFAULT_APPLICATION_SORT_FIELD).shape,
    status: z.enum(ApplicationStatus).optional(),
  }),
});

/** Validation schema for `GET /jobs/:id/applications` (params + applicant filters). */
export const jobApplicantsQuerySchema = z.object({
  params: z.object({ id: uuidSchema }),
  query: z.object({
    ...paginationQuerySchema.shape,
    ...sortQuerySchema(APPLICANT_SORT_FIELDS, DEFAULT_APPLICANT_SORT_FIELD).shape,
    status: z.enum(ApplicationStatus).optional(),
    minExperienceMonths: z.coerce.number().int().min(0).max(MAX_EXPERIENCE_MONTHS).optional(),
    maxExperienceMonths: z.coerce.number().int().min(0).max(MAX_EXPERIENCE_MONTHS).optional(),
    currentLocation: z.string().trim().max(LOCATION_MAX_LENGTH).optional(),
    preferredLocation: z.string().trim().max(LOCATION_MAX_LENGTH).optional(),
    highestEducation: z.enum(EducationLevel).optional(),
    college: z.string().trim().max(COMPANY_MAX_LENGTH).optional(),
    currentCompany: z.string().trim().max(COMPANY_MAX_LENGTH).optional(),
    skills: csvStringArraySchema,
    keyword: z.string().trim().max(SEARCH_TERM_MAX_LENGTH).optional(),
  }),
});

/** Validation schema for `PATCH /applications/:id/status`. */
export const updateStatusSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z
    .object({
      status: z.enum(HR_SETTABLE_STATUSES),
      note: z.string().trim().max(STATUS_NOTE_MAX_LENGTH).optional(),
    })
    .strict(),
});

export type ApplyInput = z.infer<typeof applySchema>['body'];
export type MyApplicationsQueryInput = z.infer<typeof myApplicationsQuerySchema>['query'];
export type JobApplicantsQueryInput = z.infer<typeof jobApplicantsQuerySchema>['query'];
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>['body'];
