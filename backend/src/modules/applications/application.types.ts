import type { ApplicationStatus, EducationLevel } from '@/generated/prisma/enums';
import type { PaginationParams, SortOrder } from '@/types/pagination';

/** Fields required to persist a new application. */
export interface CreateApplicationData {
  jobId: string;
  candidateProfileId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

/** Query options for a candidate's own applications. */
export interface MyApplicationsQuery {
  candidateProfileId: string;
  status?: ApplicationStatus;
  pagination: PaginationParams;
  sort: { sortBy: 'createdAt' | 'updatedAt' | 'status'; sortOrder: SortOrder };
}

/** Filters available on the HR applicant board. */
export interface ApplicantFilters {
  status?: ApplicationStatus;
  minExperienceMonths?: number;
  maxExperienceMonths?: number;
  currentLocation?: string;
  preferredLocation?: string;
  highestEducation?: EducationLevel;
  college?: string;
  currentCompany?: string;
  skills?: string[];
  keyword?: string;
}

/** Query options for listing the applicants of a job. */
export interface ApplicantQuery {
  jobId: string;
  filters: ApplicantFilters;
  pagination: PaginationParams;
  sort: { sortBy: 'createdAt' | 'updatedAt' | 'status' | 'experience'; sortOrder: SortOrder };
}

/** Minimal application row plus its job's owner, used for authorization checks. */
export interface ApplicationOwnership {
  id: string;
  status: ApplicationStatus;
  candidateProfileId: string;
  job: { postedById: string; deletedAt: Date | null };
}

/** Minimal job row used to validate an apply request. */
export interface JobApplyState {
  id: string;
  status: string;
  deletedAt: Date | null;
  postedById: string;
}
