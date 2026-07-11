import { getPaginationSkip } from '@/common/pagination';
import { prisma } from '@/database/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { JobStatus } from '@/generated/prisma/enums';
import { insensitiveContains } from '@/utils/prisma-search';

import type {
  CreateJobData,
  JobOwnership,
  JobQueryOptions,
  JobSort,
  UpdateJobData,
} from './job.types';

/** Relations loaded with every job so the API can render a complete card in one query. */
export const jobInclude = {
  company: {
    select: { id: true, name: true, slug: true, logoUrl: true, location: true, industry: true },
  },
  skills: {
    include: { skill: { select: { id: true, name: true, slug: true } } },
    orderBy: { skill: { name: 'asc' } },
  },
  _count: { select: { applications: true } },
} satisfies Prisma.JobInclude;

export type JobWithRelations = Prisma.JobGetPayload<{ include: typeof jobInclude }>;

function buildJobWhere(options: JobQueryOptions): Prisma.JobWhereInput {
  const { scope, filters } = options;
  const and: Prisma.JobWhereInput[] = [{ deletedAt: null }];

  if (scope.companyId) {
    and.push({ companyId: scope.companyId });
  }

  if (scope.onlyPublished) {
    and.push({ status: JobStatus.PUBLISHED });
  } else if (filters.status) {
    and.push({ status: filters.status });
  }

  if (filters.location) {
    and.push({ location: insensitiveContains(filters.location) });
  }
  if (filters.employmentType) {
    and.push({ employmentType: filters.employmentType });
  }
  if (filters.experienceLevel) {
    and.push({ experienceLevel: filters.experienceLevel });
  }
  if (filters.workMode) {
    and.push({ locationType: filters.workMode });
  }
  // Salary overlap: a job matches when its range intersects the requested range.
  if (filters.salaryMin !== undefined) {
    and.push({ salaryMax: { gte: filters.salaryMin } });
  }
  if (filters.salaryMax !== undefined) {
    and.push({ salaryMin: { lte: filters.salaryMax } });
  }
  if (filters.skills && filters.skills.length > 0) {
    and.push({ skills: { some: { skill: { slug: { in: filters.skills } } } } });
  }
  if (filters.company) {
    and.push({
      company: {
        OR: [
          { name: insensitiveContains(filters.company) },
          { slug: insensitiveContains(filters.company) },
        ],
      },
    });
  }
  if (filters.keyword) {
    const keyword = filters.keyword;
    and.push({
      OR: [
        { title: insensitiveContains(keyword) },
        { description: insensitiveContains(keyword) },
        { location: insensitiveContains(keyword) },
        { company: { name: insensitiveContains(keyword) } },
        { skills: { some: { skill: { name: insensitiveContains(keyword) } } } },
      ],
    });
  }

  return { AND: and };
}

function buildJobOrderBy(sort: JobSort): Prisma.JobOrderByWithRelationInput {
  switch (sort.sortBy) {
    case 'salary':
      return { salaryMin: sort.sortOrder };
    case 'title':
      return { title: sort.sortOrder };
    case 'company':
      return { company: { name: sort.sortOrder } };
    case 'updatedAt':
      return { updatedAt: sort.sortOrder };
    case 'createdAt':
    default:
      return { createdAt: sort.sortOrder };
  }
}

function toJobSkillCreate(skills: CreateJobData['skills']): Prisma.JobSkillCreateWithoutJobInput[] {
  return skills.map((skill) => ({
    isRequired: skill.isRequired,
    skill: { connect: { slug: skill.slug } },
  }));
}

export interface JobRepository {
  create(data: CreateJobData): Promise<JobWithRelations>;
  findById(id: string): Promise<JobWithRelations | null>;
  findMany(options: JobQueryOptions): Promise<{ items: JobWithRelations[]; total: number }>;
  update(id: string, data: UpdateJobData): Promise<JobWithRelations>;
  softDelete(id: string, deletedAt: Date): Promise<void>;
  findOwnership(id: string): Promise<JobOwnership | null>;
  findHrCompanyIdByUserId(userId: string): Promise<string | null>;
  findExistingSkillSlugs(slugs: string[]): Promise<string[]>;
}

class PrismaJobRepository implements JobRepository {
  create(data: CreateJobData): Promise<JobWithRelations> {
    const { skills, ...scalars } = data;
    return prisma.job.create({
      data: { ...scalars, skills: { create: toJobSkillCreate(skills) } },
      include: jobInclude,
    });
  }

  findById(id: string): Promise<JobWithRelations | null> {
    return prisma.job.findFirst({ where: { id, deletedAt: null }, include: jobInclude });
  }

  async findMany(options: JobQueryOptions): Promise<{ items: JobWithRelations[]; total: number }> {
    const where = buildJobWhere(options);

    // Batched in a single transaction so the page and its total share one snapshot.
    const [items, total] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        include: jobInclude,
        orderBy: buildJobOrderBy(options.sort),
        skip: getPaginationSkip(options.pagination),
        take: options.pagination.limit,
      }),
      prisma.job.count({ where }),
    ]);

    return { items, total };
  }

  update(id: string, data: UpdateJobData): Promise<JobWithRelations> {
    const { skills, ...scalars } = data;

    if (!skills) {
      return prisma.job.update({ where: { id }, data: scalars, include: jobInclude });
    }

    // Replacing skills must be atomic: clear the old join rows, then recreate them.
    return prisma.$transaction(async (tx) => {
      await tx.jobSkill.deleteMany({ where: { jobId: id } });
      return tx.job.update({
        where: { id },
        data: { ...scalars, skills: { create: toJobSkillCreate(skills) } },
        include: jobInclude,
      });
    });
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    await prisma.job.update({ where: { id }, data: { deletedAt } });
  }

  findOwnership(id: string): Promise<JobOwnership | null> {
    return prisma.job.findUnique({
      where: { id },
      select: {
        companyId: true,
        postedById: true,
        status: true,
        publishedAt: true,
        deletedAt: true,
      },
    });
  }

  async findHrCompanyIdByUserId(userId: string): Promise<string | null> {
    const hrProfile = await prisma.hrProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });
    return hrProfile?.companyId ?? null;
  }

  async findExistingSkillSlugs(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) {
      return [];
    }
    const skills = await prisma.skill.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    return skills.map((skill) => skill.slug);
  }
}

export const jobRepository: JobRepository = new PrismaJobRepository();
