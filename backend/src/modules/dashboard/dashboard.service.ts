import { DASHBOARD_RECENT_LIMIT, RECOMMENDED_JOBS_LIMIT } from '@/constants/pagination';
import { NotFoundError } from '@/errors';
import { ApplicationStatus } from '@/generated/prisma/enums';
import { toApplicationDto } from '@/modules/applications/application.dto';
import { toJobDto } from '@/modules/jobs/job.dto';

import type {
  ApplicationStatusBreakdown,
  CandidateDashboardDto,
  HrDashboardDto,
} from './dashboard.dto';
import { toHrRecentApplicationDto } from './dashboard.dto';
import { dashboardRepository } from './dashboard.repository';
import type {
  CandidateProfileSnapshot,
  DashboardRepository,
  StatusCount,
} from './dashboard.repository';

/** Number of profile attributes considered when scoring profile completion. */
const PROFILE_COMPLETION_FIELDS = 13;

function buildStatusBreakdown(counts: StatusCount[]): ApplicationStatusBreakdown {
  const breakdown = Object.values(ApplicationStatus).reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {} as ApplicationStatusBreakdown);

  for (const { status, count } of counts) {
    breakdown[status] = count;
  }
  return breakdown;
}

function computeProfileCompletion(profile: CandidateProfileSnapshot): number {
  const completedFields = [
    profile.headline,
    profile.about,
    profile.phone,
    profile.currentLocation,
    profile.preferredLocation,
    profile.currentCompany,
    profile.currentTitle,
    profile.highestEducation,
    profile.resumeUrl,
    profile.expectedSalaryMin !== null,
    profile.totalExperienceMonths > 0,
    profile.skillCount > 0,
    profile.educationCount > 0,
  ].filter(Boolean).length;

  return Math.round((completedFields / PROFILE_COMPLETION_FIELDS) * 100);
}

/**
 * Business logic for the Dashboard module. Composes the aggregate data gathered
 * by the repository into the candidate and HR dashboard contracts.
 */
export class DashboardService {
  constructor(private readonly dashboard: DashboardRepository = dashboardRepository) {}

  /** Builds the authenticated candidate's dashboard. */
  async getCandidateDashboard(userId: string): Promise<CandidateDashboardDto> {
    const data = await this.dashboard.getCandidateDashboard(
      userId,
      DASHBOARD_RECENT_LIMIT,
      RECOMMENDED_JOBS_LIMIT,
    );

    if (!data.profile) {
      throw new NotFoundError('Candidate profile not found.');
    }

    const totalApplications = data.statusCounts.reduce((sum, entry) => sum + entry.count, 0);

    return {
      profileCompletion: computeProfileCompletion(data.profile),
      applicationCounts: {
        total: totalApplications,
        byStatus: buildStatusBreakdown(data.statusCounts),
      },
      recentApplications: data.recentApplications.map(toApplicationDto),
      recommendedJobs: data.recommendedJobs.map(toJobDto),
      recentJobs: data.recentJobs.map(toJobDto),
      savedCount: 0,
    };
  }

  /** Builds the authenticated HR user's dashboard. */
  async getHrDashboard(userId: string): Promise<HrDashboardDto> {
    const data = await this.dashboard.getHrDashboard(userId, DASHBOARD_RECENT_LIMIT);

    return {
      totalJobs: data.totalJobs,
      activeJobs: data.activeJobs,
      closedJobs: data.closedJobs,
      totalApplicants: data.totalApplicants,
      applicantStatusBreakdown: buildStatusBreakdown(data.statusCounts),
      recentApplications: data.recentApplications.map(toHrRecentApplicationDto),
      recentJobs: data.recentJobs.map(toJobDto),
      topPerformingJob: data.topPerformingJob ? toJobDto(data.topPerformingJob) : null,
    };
  }
}

export const dashboardService = new DashboardService();
