import { type SelectOption, toOptions } from '@/utils/options';

/**
 * Job domain vocabulary. Values mirror the backend Prisma enums exactly; labels
 * and options drive the browse filters, job forms, and job displays so the UI
 * never hardcodes these strings.
 */

export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  TEMPORARY: 'TEMPORARY',
  FREELANCE: 'FREELANCE',
} as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary',
  FREELANCE: 'Freelance',
};

export const EMPLOYMENT_TYPE_OPTIONS: SelectOption<EmploymentType>[] =
  toOptions(EMPLOYMENT_TYPE_LABELS);

export const EXPERIENCE_LEVEL = {
  INTERNSHIP: 'INTERNSHIP',
  ENTRY_LEVEL: 'ENTRY_LEVEL',
  MID_LEVEL: 'MID_LEVEL',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  EXECUTIVE: 'EXECUTIVE',
} as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  INTERNSHIP: 'Internship',
  ENTRY_LEVEL: 'Entry level',
  MID_LEVEL: 'Mid level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

export const EXPERIENCE_LEVEL_OPTIONS: SelectOption<ExperienceLevel>[] =
  toOptions(EXPERIENCE_LEVEL_LABELS);

/** Work mode maps to the backend `LocationType` enum. */
export const WORK_MODE = {
  ONSITE: 'ONSITE',
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
} as const;

export type WorkMode = (typeof WORK_MODE)[keyof typeof WORK_MODE];

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

export const WORK_MODE_OPTIONS: SelectOption<WorkMode>[] = toOptions(WORK_MODE_LABELS);

export const SALARY_PERIOD = {
  YEARLY: 'YEARLY',
  MONTHLY: 'MONTHLY',
  HOURLY: 'HOURLY',
} as const;

export type SalaryPeriod = (typeof SALARY_PERIOD)[keyof typeof SALARY_PERIOD];

/** Short suffixes appended to formatted salary ranges (e.g. "$120k/yr"). */
export const SALARY_PERIOD_SUFFIX: Record<SalaryPeriod, string> = {
  YEARLY: '/yr',
  MONTHLY: '/mo',
  HOURLY: '/hr',
};

/** Sort options for the browse-jobs list. Values match the backend whitelist. */
export const JOB_SORT_OPTIONS: SelectOption<string>[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'salary:desc', label: 'Salary: high to low' },
  { value: 'salary:asc', label: 'Salary: low to high' },
  { value: 'title:asc', label: 'Title: A to Z' },
  { value: 'company:asc', label: 'Company: A to Z' },
];

export const DEFAULT_JOB_SORT = 'createdAt:desc';
