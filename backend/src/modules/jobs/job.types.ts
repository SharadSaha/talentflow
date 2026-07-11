import type {
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  LocationType,
  SalaryPeriod,
} from '@/generated/prisma/enums';
import type { PaginationParams, SortOrder } from '@/types/pagination';

/** A skill reference on a job, connected to the canonical Skill vocabulary by slug. */
export interface JobSkillInput {
  slug: string;
  isRequired: boolean;
}

/** Filters that can be applied when listing jobs. */
export interface JobFilters {
  keyword?: string;
  location?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  workMode?: LocationType;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  status?: JobStatus;
  company?: string;
}

/** How a job list is sorted. */
export interface JobSort {
  sortBy: 'createdAt' | 'updatedAt' | 'salary' | 'title' | 'company';
  sortOrder: SortOrder;
}

/**
 * Base scope for a job listing:
 *   - `onlyPublished` — restrict to live (PUBLISHED, non-deleted) jobs (candidate browse).
 *   - `postedById` — restrict to a single HR user's own jobs.
 */
export interface JobScope {
  onlyPublished?: boolean;
  postedById?: string;
}

/** Full set of options the repository needs to run a job list query. */
export interface JobQueryOptions {
  scope: JobScope;
  filters: JobFilters;
  pagination: PaginationParams;
  sort: JobSort;
}

/** Fields required to persist a new job. */
export interface CreateJobData {
  companyId: string;
  postedById: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  locationType: LocationType;
  location?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod: SalaryPeriod;
  openings: number;
  status: JobStatus;
  publishedAt: Date | null;
  skills: JobSkillInput[];
}

/** Fields that may be changed on an existing job. */
export interface UpdateJobData {
  title?: string;
  description?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  locationType?: LocationType;
  location?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;
  openings?: number;
  status?: JobStatus;
  publishedAt?: Date;
  skills?: JobSkillInput[];
}

/** Minimal job row used for ownership/state checks before a mutation. */
export interface JobOwnership {
  postedById: string;
  status: JobStatus;
  publishedAt: Date | null;
  deletedAt: Date | null;
}
