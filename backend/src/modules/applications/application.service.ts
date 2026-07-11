import { buildPaginationMeta } from '@/common/pagination';
import { AuthorizationError, BadRequestError, ConflictError, NotFoundError } from '@/errors';
import { ApplicationStatus, JobStatus } from '@/generated/prisma/enums';
import type { Paginated } from '@/types/pagination';
import { isUniqueConstraintViolation } from '@/utils/prisma-errors';

import type { ApplicantDto, ApplicationDto } from './application.dto';
import { toApplicantDto, toApplicationDto } from './application.dto';
import { applicationRepository } from './application.repository';
import type { ApplicationRepository } from './application.repository';
import type {
  ApplyInput,
  JobApplicantsQueryInput,
  MyApplicationsQueryInput,
  UpdateStatusInput,
} from './application.schemas';
import { canHrTransition, isWithdrawable } from './application.status';

const CANDIDATE_PROFILE_NOT_FOUND = 'Candidate profile not found.';
const APPLICATION_NOT_FOUND = 'Application not found.';
const JOB_NOT_FOUND = 'Job not found.';

/**
 * Business logic for the Applications module: applying to jobs, viewing applied
 * jobs, the HR applicant board, and the status lifecycle. Enforces all apply
 * business rules and HR/candidate ownership.
 */
export class ApplicationService {
  constructor(private readonly applications: ApplicationRepository = applicationRepository) {}

  /** Applies the authenticated candidate to a job, enforcing all apply rules. */
  async apply(userId: string, input: ApplyInput): Promise<ApplicationDto> {
    const candidateProfileId = await this.getCandidateProfileId(userId);

    const job = await this.applications.findJobApplyState(input.jobId);
    if (!job || job.deletedAt) {
      throw new NotFoundError(JOB_NOT_FOUND);
    }
    if (job.postedById === userId) {
      throw new AuthorizationError('You cannot apply to a job you posted.');
    }
    if (job.status !== JobStatus.PUBLISHED) {
      throw new ConflictError('This job is not open for applications.');
    }

    const existing = await this.applications.findExistingApplication(
      input.jobId,
      candidateProfileId,
    );
    if (existing) {
      throw new ConflictError('You have already applied to this job.');
    }

    try {
      const application = await this.applications.create({
        jobId: input.jobId,
        candidateProfileId,
        coverLetter: input.coverLetter,
        resumeUrl: input.resumeUrl,
      });
      return toApplicationDto(application);
    } catch (error) {
      // Guards against a race between the duplicate check and the insert.
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError('You have already applied to this job.');
      }
      throw error;
    }
  }

  /** Lists the authenticated candidate's own applications. */
  async getMyApplications(
    userId: string,
    query: MyApplicationsQueryInput,
  ): Promise<Paginated<ApplicationDto>> {
    const candidateProfileId = await this.getCandidateProfileId(userId);

    const { items, total } = await this.applications.findMyApplications({
      candidateProfileId,
      status: query.status,
      pagination: { page: query.page, limit: query.limit },
      sort: { sortBy: query.sortBy, sortOrder: query.sortOrder },
    });

    return {
      items: items.map(toApplicationDto),
      meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
    };
  }

  /** Lists the applicants of a job the authenticated HR user owns. */
  async getJobApplicants(
    userId: string,
    jobId: string,
    query: JobApplicantsQueryInput,
  ): Promise<Paginated<ApplicantDto>> {
    const job = await this.applications.findJobApplyState(jobId);
    if (!job || job.deletedAt) {
      throw new NotFoundError(JOB_NOT_FOUND);
    }
    if (job.postedById !== userId) {
      throw new AuthorizationError('You can only view applicants for jobs you created.');
    }

    const { items, total } = await this.applications.findApplicants({
      jobId,
      filters: {
        status: query.status,
        minExperienceMonths: query.minExperienceMonths,
        maxExperienceMonths: query.maxExperienceMonths,
        currentLocation: query.currentLocation,
        preferredLocation: query.preferredLocation,
        highestEducation: query.highestEducation,
        college: query.college,
        currentCompany: query.currentCompany,
        skills: query.skills,
        keyword: query.keyword,
      },
      pagination: { page: query.page, limit: query.limit },
      sort: { sortBy: query.sortBy, sortOrder: query.sortOrder },
    });

    return {
      items: items.map(toApplicantDto),
      meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
    };
  }

  /** Updates an applicant's status (HR owner only), enforcing valid transitions. */
  async updateStatus(
    userId: string,
    applicationId: string,
    input: UpdateStatusInput,
  ): Promise<ApplicationDto> {
    const application = await this.applications.findOwnership(applicationId);
    if (!application || application.job.deletedAt) {
      throw new NotFoundError(APPLICATION_NOT_FOUND);
    }
    if (application.job.postedById !== userId) {
      throw new AuthorizationError('You can only update applicants for jobs you created.');
    }
    if (!canHrTransition(application.status, input.status)) {
      throw new BadRequestError(
        `Cannot change application status from ${application.status} to ${input.status}.`,
      );
    }

    const updated = await this.applications.updateStatus(
      applicationId,
      input.status,
      userId,
      input.note,
    );
    return toApplicationDto(updated);
  }

  /** Withdraws the authenticated candidate's own application. */
  async withdraw(userId: string, applicationId: string): Promise<ApplicationDto> {
    const candidateProfileId = await this.getCandidateProfileId(userId);

    const application = await this.applications.findOwnership(applicationId);
    if (!application) {
      throw new NotFoundError(APPLICATION_NOT_FOUND);
    }
    if (application.candidateProfileId !== candidateProfileId) {
      throw new AuthorizationError('You can only withdraw your own applications.');
    }
    if (!isWithdrawable(application.status)) {
      throw new BadRequestError('This application can no longer be withdrawn.');
    }

    const updated = await this.applications.updateStatus(
      applicationId,
      ApplicationStatus.WITHDRAWN,
      userId,
    );
    return toApplicationDto(updated);
  }

  private async getCandidateProfileId(userId: string): Promise<string> {
    const candidateProfileId = await this.applications.findCandidateProfileIdByUserId(userId);
    if (!candidateProfileId) {
      throw new NotFoundError(CANDIDATE_PROFILE_NOT_FOUND);
    }
    return candidateProfileId;
  }
}

export const applicationService = new ApplicationService();
