import type { ApplicationStatus } from '@/constants/application-status';
import type { EmploymentType, ExperienceLevel, SalaryPeriod, WorkMode } from '@/constants/job';
import type { JobStatus } from '@/constants/job-status';
import type { SortOrder } from '@/types/pagination';

/** The job summary embedded in a candidate's application. */
export interface ApplicationJobSummary {
  id: string;
  title: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workMode: WorkMode;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  status: JobStatus;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    location: string | null;
  };
}

/** A candidate's application to a job. Mirrors the backend `ApplicationDto`. */
export interface Application {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  appliedAt: string;
  updatedAt: string;
  job: ApplicationJobSummary;
}

/** Payload for creating an application. */
export interface ApplyRequest {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

/** Query parameters for the candidate's own applications. */
export interface MyApplicationsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  status?: ApplicationStatus;
}
