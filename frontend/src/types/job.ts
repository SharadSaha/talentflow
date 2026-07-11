import type { EmploymentType, ExperienceLevel, SalaryPeriod, WorkMode } from '@/constants/job';
import type { JobStatus } from '@/constants/job-status';
import type { SortOrder } from '@/types/pagination';

/** Company summary embedded in a job. Mirrors the backend `JobCompanyDto`. */
export interface JobCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  location: string | null;
  industry: string | null;
}

/** A skill attached to a job. */
export interface JobSkill {
  id: string;
  name: string;
  slug: string;
  isRequired: boolean;
}

/** A job posting. Mirrors the backend `JobDto`. */
export interface Job {
  id: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workMode: WorkMode;
  location: string | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  openings: number;
  status: JobStatus;
  applicationCount: number;
  company: JobCompany;
  skills: JobSkill[];
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Query parameters for browsing jobs. All optional; empty values are omitted. */
export interface JobListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  keyword?: string;
  location?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  workMode?: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  company?: string;
}
