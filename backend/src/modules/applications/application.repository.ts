import { getPaginationSkip } from '@/common/pagination';
import { prisma } from '@/database/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { ApplicationStatus } from '@/generated/prisma/enums';
import { insensitiveContains } from '@/utils/prisma-search';

import type {
  ApplicantFilters,
  ApplicantQuery,
  ApplicationOwnership,
  CreateApplicationData,
  JobApplyState,
  MyApplicationsQuery,
} from './application.types';

/** Job summary loaded with a candidate's own applications. */
export const applicationJobInclude = {
  job: {
    select: {
      id: true,
      title: true,
      employmentType: true,
      experienceLevel: true,
      locationType: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      salaryCurrency: true,
      salaryPeriod: true,
      status: true,
      company: { select: { id: true, name: true, slug: true, logoUrl: true, location: true } },
    },
  },
} satisfies Prisma.ApplicationInclude;

export type ApplicationWithJob = Prisma.ApplicationGetPayload<{
  include: typeof applicationJobInclude;
}>;

/** Candidate profile loaded for the HR applicant board. */
const applicantInclude = {
  candidateProfile: {
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      skills: { include: { skill: { select: { id: true, name: true, slug: true } } } },
      education: {
        select: {
          id: true,
          institution: true,
          degree: true,
          level: true,
          fieldOfStudy: true,
          startYear: true,
          endYear: true,
        },
      },
    },
  },
} satisfies Prisma.ApplicationInclude;

export type ApplicantWithProfile = Prisma.ApplicationGetPayload<{
  include: typeof applicantInclude;
}>;

function buildCandidateProfileFilter(filters: ApplicantFilters): Prisma.CandidateProfileWhereInput {
  const and: Prisma.CandidateProfileWhereInput[] = [];

  if (filters.minExperienceMonths !== undefined) {
    and.push({ totalExperienceMonths: { gte: filters.minExperienceMonths } });
  }
  if (filters.maxExperienceMonths !== undefined) {
    and.push({ totalExperienceMonths: { lte: filters.maxExperienceMonths } });
  }
  if (filters.currentLocation) {
    and.push({ currentLocation: insensitiveContains(filters.currentLocation) });
  }
  if (filters.preferredLocation) {
    and.push({ preferredLocation: insensitiveContains(filters.preferredLocation) });
  }
  if (filters.highestEducation) {
    and.push({ highestEducation: filters.highestEducation });
  }
  if (filters.currentCompany) {
    and.push({ currentCompany: insensitiveContains(filters.currentCompany) });
  }
  if (filters.college) {
    and.push({ education: { some: { institution: insensitiveContains(filters.college) } } });
  }
  if (filters.skills && filters.skills.length > 0) {
    and.push({ skills: { some: { skill: { slug: { in: filters.skills } } } } });
  }
  if (filters.keyword) {
    const keyword = filters.keyword;
    and.push({
      OR: [
        { user: { firstName: insensitiveContains(keyword) } },
        { user: { lastName: insensitiveContains(keyword) } },
        { user: { email: insensitiveContains(keyword) } },
        { currentCompany: insensitiveContains(keyword) },
        { education: { some: { institution: insensitiveContains(keyword) } } },
        { skills: { some: { skill: { name: insensitiveContains(keyword) } } } },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

function buildApplicantWhere(query: ApplicantQuery): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = { jobId: query.jobId };

  if (query.filters.status) {
    where.status = query.filters.status;
  }

  const candidateFilter = buildCandidateProfileFilter(query.filters);
  if (Object.keys(candidateFilter).length > 0) {
    where.candidateProfile = candidateFilter;
  }

  return where;
}

function buildApplicantOrderBy(
  sort: ApplicantQuery['sort'],
): Prisma.ApplicationOrderByWithRelationInput {
  if (sort.sortBy === 'experience') {
    return { candidateProfile: { totalExperienceMonths: sort.sortOrder } };
  }
  return { [sort.sortBy]: sort.sortOrder };
}

export interface ApplicationRepository {
  create(data: CreateApplicationData): Promise<ApplicationWithJob>;
  findExistingApplication(
    jobId: string,
    candidateProfileId: string,
  ): Promise<{ id: string } | null>;
  findCandidateProfileIdByUserId(userId: string): Promise<string | null>;
  findJobApplyState(jobId: string): Promise<JobApplyState | null>;
  findOwnership(applicationId: string): Promise<ApplicationOwnership | null>;
  findMyApplications(
    query: MyApplicationsQuery,
  ): Promise<{ items: ApplicationWithJob[]; total: number }>;
  findApplicants(query: ApplicantQuery): Promise<{ items: ApplicantWithProfile[]; total: number }>;
  updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    changedById: string,
    note?: string,
  ): Promise<ApplicationWithJob>;
}

class PrismaApplicationRepository implements ApplicationRepository {
  create(data: CreateApplicationData): Promise<ApplicationWithJob> {
    return prisma.application.create({
      data: {
        jobId: data.jobId,
        candidateProfileId: data.candidateProfileId,
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
        statusEvents: { create: { status: 'APPLIED' } },
      },
      include: applicationJobInclude,
    });
  }

  findExistingApplication(
    jobId: string,
    candidateProfileId: string,
  ): Promise<{ id: string } | null> {
    return prisma.application.findUnique({
      where: { jobId_candidateProfileId: { jobId, candidateProfileId } },
      select: { id: true },
    });
  }

  async findCandidateProfileIdByUserId(userId: string): Promise<string | null> {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return profile?.id ?? null;
  }

  findJobApplyState(jobId: string): Promise<JobApplyState | null> {
    return prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, deletedAt: true, postedById: true },
    });
  }

  findOwnership(applicationId: string): Promise<ApplicationOwnership | null> {
    return prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        candidateProfileId: true,
        job: { select: { postedById: true, deletedAt: true } },
      },
    });
  }

  async findMyApplications(
    query: MyApplicationsQuery,
  ): Promise<{ items: ApplicationWithJob[]; total: number }> {
    const where: Prisma.ApplicationWhereInput = { candidateProfileId: query.candidateProfileId };
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: applicationJobInclude,
        orderBy: { [query.sort.sortBy]: query.sort.sortOrder },
        skip: getPaginationSkip(query.pagination),
        take: query.pagination.limit,
      }),
      prisma.application.count({ where }),
    ]);

    return { items, total };
  }

  async findApplicants(
    query: ApplicantQuery,
  ): Promise<{ items: ApplicantWithProfile[]; total: number }> {
    const where = buildApplicantWhere(query);

    const [items, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: applicantInclude,
        orderBy: buildApplicantOrderBy(query.sort),
        skip: getPaginationSkip(query.pagination),
        take: query.pagination.limit,
      }),
      prisma.application.count({ where }),
    ]);

    return { items, total };
  }

  updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    changedById: string,
    note?: string,
  ): Promise<ApplicationWithJob> {
    // The status change and its audit event are written atomically.
    return prisma.application.update({
      where: { id: applicationId },
      data: { status, statusEvents: { create: { status, changedById, note } } },
      include: applicationJobInclude,
    });
  }
}

export const applicationRepository: ApplicationRepository = new PrismaApplicationRepository();
