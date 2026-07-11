import { AuthorizationError, BadRequestError, NotFoundError } from '@/errors';
import { JobStatus, LocationType, SalaryPeriod, UserRole } from '@/generated/prisma/enums';
import type { AuthUser } from '@/types/auth';

import { buildJob, COMPANY_ID, HR_USER_ID } from '../../../tests/fixtures';
import { JobService } from './job.service';
import type { JobRepository } from './job.repository';
import type { CreateJobInput } from './job.schemas';

describe('JobService', () => {
  const buildRepository = () =>
    ({
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findOwnership: jest.fn(),
      findHrCompanyIdByUserId: jest.fn(),
      findExistingSkillSlugs: jest.fn(),
    }) satisfies JobRepository;

  const createInput: CreateJobInput = {
    title: 'Backend Engineer',
    description: 'Own our services.',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID_LEVEL',
    workMode: LocationType.REMOTE,
    salaryPeriod: SalaryPeriod.YEARLY,
    openings: 1,
    status: JobStatus.PUBLISHED,
    skills: [{ slug: 'react', isRequired: true }],
  };

  const hrUser: AuthUser = { id: HR_USER_ID, email: 'hr@example.com', role: UserRole.HR };

  describe('createJob', () => {
    it('creates a job for the HR user company, mapping workMode and stamping publishedAt', async () => {
      const repository = buildRepository();
      repository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      repository.findExistingSkillSlugs.mockResolvedValue(['react']);
      repository.create.mockResolvedValue(buildJob());
      const service = new JobService(repository);

      const job = await service.createJob(HR_USER_ID, createInput);

      expect(job.id).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: COMPANY_ID,
          postedById: HR_USER_ID,
          locationType: LocationType.REMOTE,
          status: JobStatus.PUBLISHED,
        }),
      );
      const [createArg] = repository.create.mock.calls[0] as [{ publishedAt: Date | null }];
      expect(createArg.publishedAt).toBeInstanceOf(Date);
    });

    it('rejects creation when the HR user has no company', async () => {
      const repository = buildRepository();
      repository.findHrCompanyIdByUserId.mockResolvedValue(null);
      const service = new JobService(repository);

      await expect(service.createJob(HR_USER_ID, createInput)).rejects.toThrow(BadRequestError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('rejects creation when a referenced skill does not exist', async () => {
      const repository = buildRepository();
      repository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      repository.findExistingSkillSlugs.mockResolvedValue([]);
      const service = new JobService(repository);

      await expect(service.createJob(HR_USER_ID, createInput)).rejects.toThrow(BadRequestError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateJob', () => {
    it('rejects updates to a job owned by another HR user', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue({
        postedById: 'another-hr',
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });
      const service = new JobService(repository);

      await expect(service.updateJob(HR_USER_ID, 'job-id', { title: 'New title' })).rejects.toThrow(
        AuthorizationError,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws NotFound when the job is missing or deleted', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue(null);
      const service = new JobService(repository);

      await expect(service.updateJob(HR_USER_ID, 'job-id', { title: 'x' })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('updates a job owned by the HR user', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue({
        postedById: HR_USER_ID,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });
      repository.update.mockResolvedValue(buildJob({ title: 'Updated' }));
      const service = new JobService(repository);

      const job = await service.updateJob(HR_USER_ID, 'job-id', { title: 'Updated' });

      expect(job.title).toBe('Updated');
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('deleteJob', () => {
    it('soft-deletes a job owned by the HR user', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue({
        postedById: HR_USER_ID,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });
      const service = new JobService(repository);

      await service.deleteJob(HR_USER_ID, 'job-id');

      expect(repository.softDelete).toHaveBeenCalledWith('job-id', expect.any(Date));
    });

    it('rejects deletion of a job owned by another HR user', async () => {
      const repository = buildRepository();
      repository.findOwnership.mockResolvedValue({
        postedById: 'another-hr',
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });
      const service = new JobService(repository);

      await expect(service.deleteJob(HR_USER_ID, 'job-id')).rejects.toThrow(AuthorizationError);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('getJobById', () => {
    it('returns a published job to any user', async () => {
      const repository = buildRepository();
      repository.findById.mockResolvedValue(buildJob({ status: JobStatus.PUBLISHED }));
      const service = new JobService(repository);
      const candidate: AuthUser = { id: 'c1', email: 'c@example.com', role: UserRole.CANDIDATE };

      const job = await service.getJobById('job-id', candidate);

      expect(job.status).toBe(JobStatus.PUBLISHED);
    });

    it('hides a non-published job from non-owners', async () => {
      const repository = buildRepository();
      repository.findById.mockResolvedValue(
        buildJob({ status: JobStatus.DRAFT, postedById: HR_USER_ID }),
      );
      const service = new JobService(repository);
      const candidate: AuthUser = { id: 'c1', email: 'c@example.com', role: UserRole.CANDIDATE };

      await expect(service.getJobById('job-id', candidate)).rejects.toThrow(NotFoundError);
    });

    it('shows a draft job to its HR owner', async () => {
      const repository = buildRepository();
      repository.findById.mockResolvedValue(
        buildJob({ status: JobStatus.DRAFT, postedById: HR_USER_ID }),
      );
      const service = new JobService(repository);

      const job = await service.getJobById('job-id', hrUser);

      expect(job.status).toBe(JobStatus.DRAFT);
    });
  });

  describe('browseJobs', () => {
    it('returns live jobs with pagination metadata', async () => {
      const repository = buildRepository();
      repository.findMany.mockResolvedValue({ items: [buildJob()], total: 1 });
      const service = new JobService(repository);

      const result = await service.browseJobs({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.items).toHaveLength(1);
      expect(result.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
      });
      const [options] = repository.findMany.mock.calls[0] as [
        { scope: { onlyPublished?: boolean } },
      ];
      expect(options.scope.onlyPublished).toBe(true);
    });
  });
});
