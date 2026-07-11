jest.mock('@/modules/jobs/job.repository', () => ({
  jobRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findOwnership: jest.fn(),
    findHrCompanyIdByUserId: jest.fn(),
    findExistingSkillSlugs: jest.fn(),
  },
}));

import request from 'supertest';

import { createApp } from '@/app';
import { signAccessToken } from '@/auth/token.service';
import { JobStatus, UserRole } from '@/generated/prisma/enums';
import { jobRepository } from '@/modules/jobs/job.repository';

import { buildJob, COMPANY_ID, HR_USER_ID, OTHER_COMPANY_ID } from './fixtures';

const mockedRepository = jobRepository as jest.Mocked<typeof jobRepository>;
const app = createApp();

const hrToken = signAccessToken({ id: HR_USER_ID, email: 'hr@example.com', role: UserRole.HR });
const candidateToken = signAccessToken({
  id: 'cand-1',
  email: 'c@example.com',
  role: UserRole.CANDIDATE,
});

const validJobBody = {
  title: 'Backend Engineer',
  description: 'Own our platform services and APIs.',
  employmentType: 'FULL_TIME',
  experienceLevel: 'MID_LEVEL',
  workMode: 'REMOTE',
  salaryMin: 1800000,
  salaryMax: 2800000,
};

describe('Jobs API', () => {
  describe('POST /api/v1/jobs', () => {
    it('creates a job for an HR user', async () => {
      mockedRepository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      mockedRepository.findExistingSkillSlugs.mockResolvedValue([]);
      mockedRepository.create.mockResolvedValue(buildJob());

      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(validJobBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.job.id).toBeDefined();
    });

    it('forbids candidates from creating jobs', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send(validJobBody);

      expect(response.status).toBe(403);
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it('rejects an invalid job body', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ title: '', description: '' });

      expect(response.status).toBe(422);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/jobs', () => {
    it('returns a paginated list of jobs', async () => {
      mockedRepository.findMany.mockResolvedValue({ items: [buildJob()], total: 1 });

      const response = await request(app)
        .get('/api/v1/jobs?page=1&limit=10&sortBy=salary&sortOrder=desc')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('rejects an invalid sort field', async () => {
      const response = await request(app)
        .get('/api/v1/jobs?sortBy=password')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(422);
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    it('returns a job by id', async () => {
      mockedRepository.findById.mockResolvedValue(buildJob({ status: JobStatus.PUBLISHED }));

      const response = await request(app)
        .get('/api/v1/jobs/019f0000-0000-7000-8000-000000000010')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.job.id).toBeDefined();
    });

    it('returns 404 for a missing job', async () => {
      mockedRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/jobs/019f0000-0000-7000-8000-000000000010')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(404);
    });

    it('rejects a non-UUID id', async () => {
      const response = await request(app)
        .get('/api/v1/jobs/not-a-uuid')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(422);
    });
  });

  describe('PATCH /api/v1/jobs/:id', () => {
    it('forbids updating a job owned by another organization', async () => {
      mockedRepository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      mockedRepository.findOwnership.mockResolvedValue({
        companyId: OTHER_COMPANY_ID,
        postedById: 'another-hr',
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .patch('/api/v1/jobs/019f0000-0000-7000-8000-000000000010')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ title: 'Hijacked' });

      expect(response.status).toBe(403);
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it('allows updating a teammate job in the same organization', async () => {
      mockedRepository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      mockedRepository.findOwnership.mockResolvedValue({
        companyId: COMPANY_ID,
        postedById: 'teammate-hr',
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });
      mockedRepository.update.mockResolvedValue(buildJob({ title: 'Team Edit' }));

      const response = await request(app)
        .patch('/api/v1/jobs/019f0000-0000-7000-8000-000000000010')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ title: 'Team Edit' });

      expect(response.status).toBe(200);
      expect(mockedRepository.update).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/hr/jobs', () => {
    it('lists all jobs for the HR user organization (including teammate postings)', async () => {
      mockedRepository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      mockedRepository.findMany.mockResolvedValue({
        items: [buildJob({ postedById: 'teammate-hr' })],
        total: 1,
      });

      const response = await request(app)
        .get('/api/v1/hr/jobs')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      const [options] = mockedRepository.findMany.mock.calls[0] as [
        { scope: { companyId?: string } },
      ];
      expect(options.scope.companyId).toBe(COMPANY_ID);
    });
  });

  describe('DELETE /api/v1/jobs/:id', () => {
    it('soft-deletes a job in the HR user organization', async () => {
      mockedRepository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      mockedRepository.findOwnership.mockResolvedValue({
        companyId: COMPANY_ID,
        postedById: HR_USER_ID,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });
      mockedRepository.softDelete.mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/v1/jobs/019f0000-0000-7000-8000-000000000010')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(mockedRepository.softDelete).toHaveBeenCalled();
    });

    it('forbids deleting a job owned by another organization', async () => {
      mockedRepository.findHrCompanyIdByUserId.mockResolvedValue(COMPANY_ID);
      mockedRepository.findOwnership.mockResolvedValue({
        companyId: OTHER_COMPANY_ID,
        postedById: 'another-hr',
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .delete('/api/v1/jobs/019f0000-0000-7000-8000-000000000010')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(403);
      expect(mockedRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
