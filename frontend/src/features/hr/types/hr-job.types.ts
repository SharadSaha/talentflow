import type { EmploymentType, ExperienceLevel, SalaryPeriod, WorkMode } from '@/constants/job';
import type { JobStatus } from '@/constants/job-status';
import type { JobListParams } from '@/types/job';

/** A skill reference on a job, connected to the canonical vocabulary by slug. */
export interface JobSkillInput {
  slug: string;
  isRequired: boolean;
}

/**
 * Payload for creating a job. Mirrors the backend `createJobSchema`. New jobs
 * may be saved as a draft or published (`status`).
 */
export interface CreateJobRequest {
  title: string;
  description: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workMode: WorkMode;
  location?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod: SalaryPeriod;
  openings: number;
  status: Extract<JobStatus, 'DRAFT' | 'PUBLISHED'>;
  skills: JobSkillInput[];
}

/** Payload for updating a job. All fields optional; `status` may also close a job. */
export type UpdateJobRequest = Partial<Omit<CreateJobRequest, 'status'>> & {
  status?: JobStatus;
};

/** Query params for the HR's own jobs list (any status). Extends browse params. */
export interface HrJobsParams extends JobListParams {
  /** Restricts results to a single job status (HR sees drafts, published, and closed). */
  status?: JobStatus;
}
