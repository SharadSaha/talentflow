import type { ApplicationStatus } from '@/generated/prisma/enums';
import type { ApplicationDto } from '@/modules/applications/application.dto';
import type { JobDto } from '@/modules/jobs/job.dto';

import type { HrRecentApplication } from './dashboard.repository';

/** Application counts keyed by every status (missing statuses default to 0). */
export type ApplicationStatusBreakdown = Record<ApplicationStatus, number>;

/** Candidate dashboard payload. */
export interface CandidateDashboardDto {
  profileCompletion: number;
  applicationCounts: { total: number; byStatus: ApplicationStatusBreakdown };
  recentApplications: ApplicationDto[];
  recommendedJobs: JobDto[];
  recentJobs: JobDto[];
  savedCount: number;
}

/** A compact recent application shown on the HR dashboard. */
export interface HrRecentApplicationDto {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
}

/** HR dashboard payload. */
export interface HrDashboardDto {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplicants: number;
  applicantStatusBreakdown: ApplicationStatusBreakdown;
  recentApplications: HrRecentApplicationDto[];
  recentJobs: JobDto[];
  topPerformingJob: JobDto | null;
}

/** Maps a compact HR recent-application row to its DTO. */
export function toHrRecentApplicationDto(row: HrRecentApplication): HrRecentApplicationDto {
  return {
    id: row.id,
    status: row.status,
    appliedAt: row.createdAt.toISOString(),
    candidateId: row.candidateProfile.id,
    candidateName: `${row.candidateProfile.user.firstName} ${row.candidateProfile.user.lastName}`,
    jobId: row.job.id,
    jobTitle: row.job.title,
  };
}
