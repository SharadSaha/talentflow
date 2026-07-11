import { prisma } from '@/database/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { ApplicationStatus, EducationLevel } from '@/generated/prisma/enums';
import { JobStatus } from '@/generated/prisma/enums';
import { applicationJobInclude } from '@/modules/applications/application.repository';
import type { ApplicationWithJob } from '@/modules/applications/application.repository';
import { jobInclude } from '@/modules/jobs/job.repository';
import type { JobWithRelations } from '@/modules/jobs/job.repository';

/** Aggregated status counts as returned by Prisma `groupBy`. */
export interface StatusCount {
  status: ApplicationStatus;
  count: number;
}

/** Candidate profile snapshot used for dashboard completion and recommendations. */
export interface CandidateProfileSnapshot {
  id: string;
  headline: string | null;
  about: string | null;
  phone: string | null;
  currentLocation: string | null;
  preferredLocation: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  totalExperienceMonths: number;
  highestEducation: EducationLevel | null;
  expectedSalaryMin: number | null;
  resumeUrl: string | null;
  skillSlugs: string[];
  skillCount: number;
  educationCount: number;
}

/** Compact recent-application row for the HR dashboard. */
const hrRecentApplicationSelect = {
  id: true,
  status: true,
  createdAt: true,
  job: { select: { id: true, title: true } },
  candidateProfile: {
    select: { id: true, user: { select: { firstName: true, lastName: true } } },
  },
} satisfies Prisma.ApplicationSelect;

export type HrRecentApplication = Prisma.ApplicationGetPayload<{
  select: typeof hrRecentApplicationSelect;
}>;

export interface CandidateDashboardData {
  profile: CandidateProfileSnapshot | null;
  recentApplications: ApplicationWithJob[];
  statusCounts: StatusCount[];
  recommendedJobs: JobWithRelations[];
  recentJobs: JobWithRelations[];
}

export interface HrDashboardData {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplicants: number;
  statusCounts: StatusCount[];
  recentApplications: HrRecentApplication[];
  recentJobs: JobWithRelations[];
  topPerformingJob: JobWithRelations | null;
}

export interface DashboardRepository {
  getCandidateDashboard(
    userId: string,
    recentLimit: number,
    recommendedLimit: number,
  ): Promise<CandidateDashboardData>;
  getHrDashboard(userId: string, recentLimit: number): Promise<HrDashboardData>;
}

function toStatusCounts(
  groups: { status: ApplicationStatus; _count: { _all: number } }[],
): StatusCount[] {
  return groups.map((group) => ({ status: group.status, count: group._count._all }));
}

class PrismaDashboardRepository implements DashboardRepository {
  async getCandidateDashboard(
    userId: string,
    recentLimit: number,
    recommendedLimit: number,
  ): Promise<CandidateDashboardData> {
    const profileRow = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: { select: { skill: { select: { slug: true } } } },
        education: { select: { id: true } },
      },
    });

    if (!profileRow) {
      return {
        profile: null,
        recentApplications: [],
        statusCounts: [],
        recommendedJobs: [],
        recentJobs: [],
      };
    }

    const candidateProfileId = profileRow.id;
    const skillSlugs = profileRow.skills.map((candidateSkill) => candidateSkill.skill.slug);

    // `groupBy` is run alongside (not inside) the transaction: batching it in a
    // `$transaction` array widens its `_count` type. Promise.all keeps them parallel.
    const [[recentApplications, appliedJobs, recentJobs], statusGroups] = await Promise.all([
      prisma.$transaction([
        prisma.application.findMany({
          where: { candidateProfileId },
          include: applicationJobInclude,
          orderBy: { createdAt: 'desc' },
          take: recentLimit,
        }),
        prisma.application.findMany({ where: { candidateProfileId }, select: { jobId: true } }),
        prisma.job.findMany({
          where: { status: JobStatus.PUBLISHED, deletedAt: null },
          include: jobInclude,
          orderBy: { createdAt: 'desc' },
          take: recentLimit,
        }),
      ]),
      prisma.application.groupBy({
        by: ['status'],
        where: { candidateProfileId },
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
    ]);

    const appliedJobIds = appliedJobs.map((application) => application.jobId);
    const recommendedJobs = await this.findRecommendedJobs(
      skillSlugs,
      appliedJobIds,
      recommendedLimit,
    );

    return {
      profile: {
        id: candidateProfileId,
        headline: profileRow.headline,
        about: profileRow.about,
        phone: profileRow.phone,
        currentLocation: profileRow.currentLocation,
        preferredLocation: profileRow.preferredLocation,
        currentCompany: profileRow.currentCompany,
        currentTitle: profileRow.currentTitle,
        totalExperienceMonths: profileRow.totalExperienceMonths,
        highestEducation: profileRow.highestEducation,
        expectedSalaryMin: profileRow.expectedSalaryMin,
        resumeUrl: profileRow.resumeUrl,
        skillSlugs,
        skillCount: skillSlugs.length,
        educationCount: profileRow.education.length,
      },
      recentApplications,
      statusCounts: toStatusCounts(statusGroups),
      recommendedJobs,
      recentJobs,
    };
  }

  private findRecommendedJobs(
    skillSlugs: string[],
    appliedJobIds: string[],
    limit: number,
  ): Promise<JobWithRelations[]> {
    if (skillSlugs.length === 0) {
      return Promise.resolve([]);
    }

    const where: Prisma.JobWhereInput = {
      status: JobStatus.PUBLISHED,
      deletedAt: null,
      skills: { some: { skill: { slug: { in: skillSlugs } } } },
    };
    if (appliedJobIds.length > 0) {
      where.id = { notIn: appliedJobIds };
    }

    return prisma.job.findMany({
      where,
      include: jobInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getHrDashboard(userId: string, recentLimit: number): Promise<HrDashboardData> {
    // Analytics are scoped to the HR user's whole organization, derived
    // server-side from their HrProfile — never from personal `postedById`.
    const hrProfile = await prisma.hrProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!hrProfile) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        closedJobs: 0,
        totalApplicants: 0,
        statusCounts: [],
        recentApplications: [],
        recentJobs: [],
        topPerformingJob: null,
      };
    }

    const ownedJobsWhere: Prisma.JobWhereInput = {
      companyId: hrProfile.companyId,
      deletedAt: null,
    };
    const ownedApplicationsWhere: Prisma.ApplicationWhereInput = {
      job: { companyId: hrProfile.companyId, deletedAt: null },
    };

    const [
      [totalJobs, activeJobs, closedJobs, totalApplicants, recentApplications, recentJobs, topJobs],
      statusGroups,
    ] = await Promise.all([
      prisma.$transaction([
        prisma.job.count({ where: ownedJobsWhere }),
        prisma.job.count({ where: { ...ownedJobsWhere, status: JobStatus.PUBLISHED } }),
        prisma.job.count({ where: { ...ownedJobsWhere, status: JobStatus.CLOSED } }),
        prisma.application.count({ where: ownedApplicationsWhere }),
        prisma.application.findMany({
          where: ownedApplicationsWhere,
          select: hrRecentApplicationSelect,
          orderBy: { createdAt: 'desc' },
          take: recentLimit,
        }),
        prisma.job.findMany({
          where: ownedJobsWhere,
          include: jobInclude,
          orderBy: { createdAt: 'desc' },
          take: recentLimit,
        }),
        prisma.job.findMany({
          where: ownedJobsWhere,
          include: jobInclude,
          orderBy: { applications: { _count: 'desc' } },
          take: 1,
        }),
      ]),
      prisma.application.groupBy({
        by: ['status'],
        where: ownedApplicationsWhere,
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplicants,
      statusCounts: toStatusCounts(statusGroups),
      recentApplications,
      recentJobs,
      topPerformingJob: topJobs[0] ?? null,
    };
  }
}

export const dashboardRepository: DashboardRepository = new PrismaDashboardRepository();
