import { buildPaginationMeta } from '@/common/pagination';
import { AuthorizationError, BadRequestError, NotFoundError } from '@/errors';
import { JobStatus, UserRole } from '@/generated/prisma/enums';
import type { AuthUser } from '@/types/auth';
import type { Paginated } from '@/types/pagination';

import type { JobDto } from './job.dto';
import { toJobDto } from './job.dto';
import { jobRepository } from './job.repository';
import type { JobRepository } from './job.repository';
import type { CreateJobInput, JobListQueryInput, UpdateJobInput } from './job.schemas';
import type { CreateJobData, JobQueryOptions, JobScope, UpdateJobData } from './job.types';

const JOB_NOT_FOUND_MESSAGE = 'Job not found.';
const NOT_JOB_OWNER_MESSAGE = 'You can only modify jobs you created.';

/**
 * Business logic for the Jobs module. Enforces HR ownership on mutations,
 * candidate visibility rules (only live jobs), and skill/company integrity.
 */
export class JobService {
  constructor(private readonly jobs: JobRepository = jobRepository) {}

  /** Creates a job for the authenticated HR user's company. */
  async createJob(userId: string, input: CreateJobInput): Promise<JobDto> {
    const companyId = await this.jobs.findHrCompanyIdByUserId(userId);
    if (!companyId) {
      throw new BadRequestError('Your HR account is not linked to a company.');
    }

    await this.assertSkillsExist(input.skills);

    const data: CreateJobData = {
      companyId,
      postedById: userId,
      title: input.title,
      description: input.description,
      employmentType: input.employmentType,
      experienceLevel: input.experienceLevel,
      locationType: input.workMode,
      location: input.location,
      minExperienceYears: input.minExperienceYears,
      maxExperienceYears: input.maxExperienceYears,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      salaryCurrency: input.salaryCurrency,
      salaryPeriod: input.salaryPeriod,
      openings: input.openings,
      status: input.status,
      publishedAt: input.status === JobStatus.PUBLISHED ? new Date() : null,
      skills: input.skills,
    };

    const job = await this.jobs.create(data);
    return toJobDto(job);
  }

  /** Updates a job the authenticated HR user owns. */
  async updateJob(userId: string, jobId: string, input: UpdateJobInput): Promise<JobDto> {
    const ownership = await this.assertOwnedJob(userId, jobId);

    if (input.skills) {
      await this.assertSkillsExist(input.skills);
    }

    const data: UpdateJobData = {
      title: input.title,
      description: input.description,
      employmentType: input.employmentType,
      experienceLevel: input.experienceLevel,
      locationType: input.workMode,
      location: input.location,
      minExperienceYears: input.minExperienceYears,
      maxExperienceYears: input.maxExperienceYears,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      salaryCurrency: input.salaryCurrency,
      salaryPeriod: input.salaryPeriod,
      openings: input.openings,
      status: input.status,
      skills: input.skills,
    };

    // Stamp publishedAt the first time a job goes live.
    const isBecomingPublished =
      input.status === JobStatus.PUBLISHED && ownership.status !== JobStatus.PUBLISHED;
    if (isBecomingPublished && !ownership.publishedAt) {
      data.publishedAt = new Date();
    }

    const job = await this.jobs.update(jobId, data);
    return toJobDto(job);
  }

  /** Soft-deletes a job the authenticated HR user owns, preserving its applications. */
  async deleteJob(userId: string, jobId: string): Promise<void> {
    await this.assertOwnedJob(userId, jobId);
    await this.jobs.softDelete(jobId, new Date());
  }

  /**
   * Returns a single job. Live jobs are visible to anyone; non-live jobs
   * (draft/closed) are visible only to the HR owner. Missing/hidden jobs 404.
   */
  async getJobById(jobId: string, requester: AuthUser): Promise<JobDto> {
    const job = await this.jobs.findById(jobId);
    if (!job) {
      throw new NotFoundError(JOB_NOT_FOUND_MESSAGE);
    }

    const isOwner = requester.role === UserRole.HR && job.postedById === requester.id;
    if (job.status !== JobStatus.PUBLISHED && !isOwner) {
      throw new NotFoundError(JOB_NOT_FOUND_MESSAGE);
    }

    return toJobDto(job);
  }

  /** Lists live jobs for candidates to browse. */
  browseJobs(query: JobListQueryInput): Promise<Paginated<JobDto>> {
    return this.listJobs(query, { onlyPublished: true });
  }

  /** Lists the authenticated HR user's own jobs (any status). */
  getHrJobs(userId: string, query: JobListQueryInput): Promise<Paginated<JobDto>> {
    return this.listJobs(query, { postedById: userId });
  }

  private async listJobs(query: JobListQueryInput, scope: JobScope): Promise<Paginated<JobDto>> {
    const options: JobQueryOptions = {
      scope,
      filters: {
        keyword: query.keyword,
        location: query.location,
        employmentType: query.employmentType,
        experienceLevel: query.experienceLevel,
        workMode: query.workMode,
        salaryMin: query.salaryMin,
        salaryMax: query.salaryMax,
        skills: query.skills,
        status: query.status,
        company: query.company,
      },
      pagination: { page: query.page, limit: query.limit },
      sort: { sortBy: query.sortBy, sortOrder: query.sortOrder },
    };

    const { items, total } = await this.jobs.findMany(options);

    return {
      items: items.map(toJobDto),
      meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
    };
  }

  private async assertOwnedJob(userId: string, jobId: string) {
    const ownership = await this.jobs.findOwnership(jobId);
    if (!ownership || ownership.deletedAt) {
      throw new NotFoundError(JOB_NOT_FOUND_MESSAGE);
    }
    if (ownership.postedById !== userId) {
      throw new AuthorizationError(NOT_JOB_OWNER_MESSAGE);
    }
    return ownership;
  }

  private async assertSkillsExist(skills: { slug: string }[]): Promise<void> {
    const slugs = skills.map((skill) => skill.slug);
    if (slugs.length === 0) {
      return;
    }

    const existingSlugs = await this.jobs.findExistingSkillSlugs(slugs);
    const missingSlugs = slugs.filter((slug) => !existingSlugs.includes(slug));
    if (missingSlugs.length > 0) {
      throw new BadRequestError(`Unknown skill(s): ${missingSlugs.join(', ')}.`);
    }
  }
}

export const jobService = new JobService();
