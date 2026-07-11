import type { ApplicationStatus } from '@/constants/application-status';
import type { Application } from '@/types/application';
import type { Job } from '@/types/job';

/** Application counts keyed by every status. Mirrors the backend breakdown. */
export type ApplicationStatusBreakdown = Record<ApplicationStatus, number>;

/** Candidate dashboard payload. Mirrors the backend `CandidateDashboardDto`. */
export interface CandidateDashboard {
  profileCompletion: number;
  applicationCounts: {
    total: number;
    byStatus: ApplicationStatusBreakdown;
  };
  recentApplications: Application[];
  recommendedJobs: Job[];
  recentJobs: Job[];
  savedCount: number;
}
