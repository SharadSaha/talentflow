import { APPLICATION_STATUS } from '@/constants/application-status';
import { EMPLOYMENT_TYPE, EXPERIENCE_LEVEL, SALARY_PERIOD, WORK_MODE } from '@/constants/job';
import { JOB_STATUS } from '@/constants/job-status';
import type { Application } from '@/types/application';
import type { Job } from '@/types/job';
import type { PaginationMeta } from '@/types/pagination';

/** Builds a Job with sensible defaults; override any field per test. */
export function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    description: 'Build delightful interfaces.',
    employmentType: EMPLOYMENT_TYPE.FULL_TIME,
    experienceLevel: EXPERIENCE_LEVEL.SENIOR,
    workMode: WORK_MODE.REMOTE,
    location: 'Berlin',
    minExperienceYears: 4,
    maxExperienceYears: 8,
    salaryMin: 90000,
    salaryMax: 130000,
    salaryCurrency: 'USD',
    salaryPeriod: SALARY_PERIOD.YEARLY,
    openings: 2,
    status: JOB_STATUS.PUBLISHED,
    applicationCount: 12,
    company: {
      id: 'company-1',
      name: 'NovaTech',
      slug: 'novatech',
      logoUrl: null,
      location: 'Berlin',
      industry: 'Software',
    },
    skills: [
      { id: 's1', name: 'React', slug: 'react', isRequired: true },
      { id: 's2', name: 'TypeScript', slug: 'typescript', isRequired: true },
    ],
    publishedAt: '2026-06-01T00:00:00.000Z',
    expiresAt: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Builds a candidate Application referencing a job; override any field per test. */
export function makeApplication(overrides: Partial<Application> = {}): Application {
  const job = makeJob(overrides.job ? undefined : {});
  return {
    id: 'app-1',
    status: APPLICATION_STATUS.APPLIED,
    coverLetter: null,
    resumeUrl: null,
    appliedAt: '2026-06-10T00:00:00.000Z',
    updatedAt: '2026-06-10T00:00:00.000Z',
    job: {
      id: job.id,
      title: job.title,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      workMode: job.workMode,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryPeriod: job.salaryPeriod,
      status: job.status,
      company: {
        id: job.company.id,
        name: job.company.name,
        slug: job.company.slug,
        logoUrl: job.company.logoUrl,
        location: job.company.location,
      },
    },
    ...overrides,
  };
}

/** Builds pagination metadata for a given item count. */
export function makeMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    ...overrides,
  };
}
