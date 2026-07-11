import type { ApplicationStatus } from '@/constants/application-status';
import type { ApplicationStatusBreakdown } from '@/types/dashboard';
import type { Job } from '@/types/job';

/** A compact recent application shown on the HR dashboard. */
export interface HrRecentApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
}

/** HR dashboard payload. Mirrors backend `HrDashboardDto`. */
export interface HrDashboard {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplicants: number;
  applicantStatusBreakdown: ApplicationStatusBreakdown;
  recentApplications: HrRecentApplication[];
  recentJobs: Job[];
  topPerformingJob: Job | null;
}
