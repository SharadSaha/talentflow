import { AuthorizationError, BadRequestError, ConflictError, NotFoundError } from '@/errors';
import { ApplicationStatus, JobStatus } from '@/generated/prisma/enums';

import {
  buildApplicantWithProfile,
  buildApplicationWithJob,
  CANDIDATE_PROFILE_ID,
  CANDIDATE_USER_ID,
  HR_USER_ID,
  JOB_ID,
} from '../../../tests/fixtures';
import { ApplicationService } from './application.service';
import type { ApplicationRepository } from './application.repository';
import type { HrApplicantsQueryInput } from './application.schemas';

describe('ApplicationService', () => {
  const buildRepository = () =>
    ({
      create: jest.fn(),
      findExistingApplication: jest.fn(),
      findCandidateProfileIdByUserId: jest.fn(),
      findJobApplyState: jest.fn(),
      findOwnership: jest.fn(),
      findMyApplications: jest.fn(),
      findApplicants: jest.fn(),
      findHrApplicants: jest.fn(),
      updateStatus: jest.fn(),
    }) satisfies ApplicationRepository;

  const liveJob = {
    id: JOB_ID,
    status: JobStatus.PUBLISHED,
    deletedAt: null,
    postedById: HR_USER_ID,
  };

  describe('apply', () => {
    it('creates an application for a live job', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findJobApplyState.mockResolvedValue(liveJob);
      repository.findExistingApplication.mockResolvedValue(null);
      repository.create.mockResolvedValue(buildApplicationWithJob());
      const service = new ApplicationService(repository);

      const application = await service.apply(CANDIDATE_USER_ID, { jobId: JOB_ID });

      expect(application.status).toBe(ApplicationStatus.APPLIED);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: JOB_ID, candidateProfileId: CANDIDATE_PROFILE_ID }),
      );
    });

    it('throws NotFound when the candidate has no profile', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(null);
      const service = new ApplicationService(repository);

      await expect(service.apply(CANDIDATE_USER_ID, { jobId: JOB_ID })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws NotFound when the job is deleted', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findJobApplyState.mockResolvedValue({ ...liveJob, deletedAt: new Date() });
      const service = new ApplicationService(repository);

      await expect(service.apply(CANDIDATE_USER_ID, { jobId: JOB_ID })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('rejects applying to a non-published job', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findJobApplyState.mockResolvedValue({ ...liveJob, status: JobStatus.CLOSED });
      const service = new ApplicationService(repository);

      await expect(service.apply(CANDIDATE_USER_ID, { jobId: JOB_ID })).rejects.toThrow(
        ConflictError,
      );
    });

    it('rejects applying to a job the user posted', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findJobApplyState.mockResolvedValue({ ...liveJob, postedById: CANDIDATE_USER_ID });
      const service = new ApplicationService(repository);

      await expect(service.apply(CANDIDATE_USER_ID, { jobId: JOB_ID })).rejects.toThrow(
        AuthorizationError,
      );
    });

    it('rejects a duplicate application', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findJobApplyState.mockResolvedValue(liveJob);
      repository.findExistingApplication.mockResolvedValue({ id: 'existing' });
      const service = new ApplicationService(repository);

      await expect(service.apply(CANDIDATE_USER_ID, { jobId: JOB_ID })).rejects.toThrow(
        ConflictError,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('maps a unique-constraint race to a ConflictError', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findJobApplyState.mockResolvedValue(liveJob);
      repository.findExistingApplication.mockResolvedValue(null);
      repository.create.mockRejectedValue({ code: 'P2002' });
      const service = new ApplicationService(repository);

      await expect(service.apply(CANDIDATE_USER_ID, { jobId: JOB_ID })).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe('getHrApplicants', () => {
    const baseQuery: HrApplicantsQueryInput = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    it('scopes the repository query to the authenticated HR user', async () => {
      const repository = buildRepository();
      repository.findHrApplicants.mockResolvedValue({
        items: [buildApplicantWithProfile()],
        total: 1,
      });
      const service = new ApplicationService(repository);

      const result = await service.getHrApplicants(HR_USER_ID, baseQuery);

      expect(repository.findHrApplicants).toHaveBeenCalledWith(
        expect.objectContaining({ hrUserId: HR_USER_ID }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual(
        expect.objectContaining({ page: 1, limit: 20, total: 1, totalPages: 1 }),
      );
    });

    it('includes the owning job (id and title) on each applicant DTO', async () => {
      const repository = buildRepository();
      repository.findHrApplicants.mockResolvedValue({
        items: [buildApplicantWithProfile()],
        total: 1,
      });
      const service = new ApplicationService(repository);

      const { items } = await service.getHrApplicants(HR_USER_ID, baseQuery);

      expect(items[0]?.job).toEqual({ id: JOB_ID, title: 'Senior Full-Stack Engineer' });
    });

    it('forwards the status filter to the repository', async () => {
      const repository = buildRepository();
      repository.findHrApplicants.mockResolvedValue({ items: [], total: 0 });
      const service = new ApplicationService(repository);

      await service.getHrApplicants(HR_USER_ID, {
        ...baseQuery,
        status: ApplicationStatus.SHORTLISTED,
      });

      expect(repository.findHrApplicants).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ status: ApplicationStatus.SHORTLISTED }),
        }),
      );
    });

    it('forwards pagination and sort options to the repository', async () => {
      const repository = buildRepository();
      repository.findHrApplicants.mockResolvedValue({ items: [], total: 0 });
      const service = new ApplicationService(repository);

      await service.getHrApplicants(HR_USER_ID, {
        ...baseQuery,
        page: 3,
        limit: 5,
        sortBy: 'experience',
        sortOrder: 'asc',
      });

      expect(repository.findHrApplicants).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: { page: 3, limit: 5 },
          sort: { sortBy: 'experience', sortOrder: 'asc' },
        }),
      );
    });
  });

  describe('updateStatus', () => {
    const ownedApplication = {
      id: 'app-id',
      status: ApplicationStatus.APPLIED,
      candidateProfileId: CANDIDATE_PROFILE_ID,
      job: { postedById: HR_USER_ID, deletedAt: null },
    };

    it('advances the status through a valid transition', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue(ownedApplication);
      repository.updateStatus.mockResolvedValue(
        buildApplicationWithJob({ status: ApplicationStatus.UNDER_REVIEW }),
      );
      const service = new ApplicationService(repository);

      const application = await service.updateStatus(HR_USER_ID, 'app-id', {
        status: ApplicationStatus.UNDER_REVIEW,
      });

      expect(application.status).toBe(ApplicationStatus.UNDER_REVIEW);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'app-id',
        ApplicationStatus.UNDER_REVIEW,
        HR_USER_ID,
        undefined,
      );
    });

    it('rejects an invalid transition', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue(ownedApplication);
      const service = new ApplicationService(repository);

      await expect(
        service.updateStatus(HR_USER_ID, 'app-id', { status: ApplicationStatus.HIRED }),
      ).rejects.toThrow(BadRequestError);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('rejects updates for a job owned by another HR user', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue({
        ...ownedApplication,
        job: { postedById: 'another-hr', deletedAt: null },
      });
      const service = new ApplicationService(repository);

      await expect(
        service.updateStatus(HR_USER_ID, 'app-id', { status: ApplicationStatus.UNDER_REVIEW }),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe('withdraw', () => {
    it('withdraws the candidate own active application', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findOwnership.mockResolvedValue({
        id: 'app-id',
        status: ApplicationStatus.APPLIED,
        candidateProfileId: CANDIDATE_PROFILE_ID,
        job: { postedById: HR_USER_ID, deletedAt: null },
      });
      repository.updateStatus.mockResolvedValue(
        buildApplicationWithJob({ status: ApplicationStatus.WITHDRAWN }),
      );
      const service = new ApplicationService(repository);

      const application = await service.withdraw(CANDIDATE_USER_ID, 'app-id');

      expect(application.status).toBe(ApplicationStatus.WITHDRAWN);
    });

    it('rejects withdrawing another candidate application', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findOwnership.mockResolvedValue({
        id: 'app-id',
        status: ApplicationStatus.APPLIED,
        candidateProfileId: 'another-candidate',
        job: { postedById: HR_USER_ID, deletedAt: null },
      });
      const service = new ApplicationService(repository);

      await expect(service.withdraw(CANDIDATE_USER_ID, 'app-id')).rejects.toThrow(
        AuthorizationError,
      );
    });

    it('rejects withdrawing a terminal application', async () => {
      const repository = buildRepository();
      repository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      repository.findOwnership.mockResolvedValue({
        id: 'app-id',
        status: ApplicationStatus.HIRED,
        candidateProfileId: CANDIDATE_PROFILE_ID,
        job: { postedById: HR_USER_ID, deletedAt: null },
      });
      const service = new ApplicationService(repository);

      await expect(service.withdraw(CANDIDATE_USER_ID, 'app-id')).rejects.toThrow(BadRequestError);
    });
  });
});
