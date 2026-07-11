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

/** Sort options shared by the per-job and cross-job applicant boards. */
export interface ApplicantSort {
  sortBy: 'createdAt' | 'updatedAt' | 'status' | 'experience';
  sortOrder: SortOrder;
}

/** Query options for listing the applicants of a single job. */
export interface ApplicantQuery {
  jobId: string;
  filters: ApplicantFilters;
  pagination: PaginationParams;
  sort: ApplicantSort;
}

/** Query options for listing applicants across every job in an organization. */
export interface HrApplicantQuery {
  hrCompanyId: string;
  filters: ApplicantFilters;
  pagination: PaginationParams;
  sort: ApplicantSort;
}

/** Minimal application row plus its job's organization, used for authorization. */
export interface ApplicationOwnership {
  id: string;
  status: ApplicationStatus;
  candidateProfileId: string;
  job: { companyId: string; postedById: string; deletedAt: Date | null };
}

/** Minimal job row used to validate an apply request. */
export interface JobApplyState {
  id: string;
  status: string;
  deletedAt: Date | null;
  companyId: string;
  postedById: string;
}
