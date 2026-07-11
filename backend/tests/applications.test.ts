jest.mock('@/modules/applications/application.repository', () => ({
  applicationRepository: {
    create: jest.fn(),
    findExistingApplication: jest.fn(),
    findCandidateProfileIdByUserId: jest.fn(),
    findJobApplyState: jest.fn(),
    findOwnership: jest.fn(),
    findMyApplications: jest.fn(),
    findApplicants: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

import request from 'supertest';

import { createApp } from '@/app';
import { signAccessToken } from '@/auth/token.service';
import { ApplicationStatus, JobStatus, UserRole } from '@/generated/prisma/enums';
import { applicationRepository } from '@/modules/applications/application.repository';

import {
  buildApplicantWithProfile,
  buildApplicationWithJob,
  CANDIDATE_PROFILE_ID,
  HR_USER_ID,
  JOB_ID,
} from './fixtures';

const mockedRepository = applicationRepository as jest.Mocked<typeof applicationRepository>;
const app = createApp();

const CANDIDATE_ID = 'cand-1';
const hrToken = signAccessToken({ id: HR_USER_ID, email: 'hr@example.com', role: UserRole.HR });
const candidateToken = signAccessToken({
  id: CANDIDATE_ID,
  email: 'c@example.com',
  role: UserRole.CANDIDATE,
});

const JOB_PATH = `/api/v1/jobs/${JOB_ID}/applications`;
const APP_ID = '019f0000-0000-7000-8000-000000000020';

describe('Applications API', () => {
  describe('POST /api/v1/applications', () => {
    it('lets a candidate apply to a live job', async () => {
      mockedRepository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      mockedRepository.findJobApplyState.mockResolvedValue({
        id: JOB_ID,
        status: JobStatus.PUBLISHED,
        deletedAt: null,
        postedById: HR_USER_ID,
      });
      mockedRepository.findExistingApplication.mockResolvedValue(null);
      mockedRepository.create.mockResolvedValue(buildApplicationWithJob());

      const response = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobId: JOB_ID });

      expect(response.status).toBe(201);
      expect(response.body.data.application.status).toBe(ApplicationStatus.APPLIED);
    });

    it('returns 409 for a duplicate application', async () => {
      mockedRepository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      mockedRepository.findJobApplyState.mockResolvedValue({
        id: JOB_ID,
        status: JobStatus.PUBLISHED,
        deletedAt: null,
        postedById: HR_USER_ID,
      });
      mockedRepository.findExistingApplication.mockResolvedValue({ id: 'existing' });

      const response = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobId: JOB_ID });

      expect(response.status).toBe(409);
    });

    it('forbids HR users from applying', async () => {
      const response = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ jobId: JOB_ID });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/jobs/:id/applications', () => {
    it('returns applicants for the HR owner of the job', async () => {
      mockedRepository.findJobApplyState.mockResolvedValue({
        id: JOB_ID,
        status: JobStatus.PUBLISHED,
        deletedAt: null,
        postedById: HR_USER_ID,
      });
      mockedRepository.findApplicants.mockResolvedValue({
        items: [buildApplicantWithProfile()],
        total: 1,
      });

      const response = await request(app).get(JOB_PATH).set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].candidate.email).toBe('candidate@example.com');
      expect(response.body.meta.total).toBe(1);
    });

    it('forbids viewing applicants for a job owned by another HR user', async () => {
      mockedRepository.findJobApplyState.mockResolvedValue({
        id: JOB_ID,
        status: JobStatus.PUBLISHED,
        deletedAt: null,
        postedById: 'another-hr',
      });

      const response = await request(app).get(JOB_PATH).set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(403);
      expect(mockedRepository.findApplicants).not.toHaveBeenCalled();
    });

    it('forbids candidates from viewing applicants', async () => {
      const response = await request(app)
        .get(JOB_PATH)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/applications/:id/status', () => {
    const ownedApplication = {
      id: APP_ID,
      status: ApplicationStatus.APPLIED,
      candidateProfileId: CANDIDATE_PROFILE_ID,
      job: { postedById: HR_USER_ID, deletedAt: null },
    };

    it('updates an applicant status through a valid transition', async () => {
      mockedRepository.findOwnership.mockResolvedValue(ownedApplication);
      mockedRepository.updateStatus.mockResolvedValue(
        buildApplicationWithJob({ status: ApplicationStatus.UNDER_REVIEW }),
      );

      const response = await request(app)
        .patch(`/api/v1/applications/${APP_ID}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ status: ApplicationStatus.UNDER_REVIEW });

      expect(response.status).toBe(200);
      expect(response.body.data.application.status).toBe(ApplicationStatus.UNDER_REVIEW);
    });

    it('rejects an invalid transition', async () => {
      mockedRepository.findOwnership.mockResolvedValue(ownedApplication);

      const response = await request(app)
        .patch(`/api/v1/applications/${APP_ID}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ status: ApplicationStatus.HIRED });

      expect(response.status).toBe(400);
    });

    it('rejects a status value outside the HR-settable set', async () => {
      const response = await request(app)
        .patch(`/api/v1/applications/${APP_ID}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ status: 'WITHDRAWN' });

      expect(response.status).toBe(422);
    });

    it('forbids candidates from updating status', async () => {
      const response = await request(app)
        .patch(`/api/v1/applications/${APP_ID}/status`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ status: ApplicationStatus.UNDER_REVIEW });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/applications/me', () => {
    it('returns the candidate own applications', async () => {
      mockedRepository.findCandidateProfileIdByUserId.mockResolvedValue(CANDIDATE_PROFILE_ID);
      mockedRepository.findMyApplications.mockResolvedValue({
        items: [buildApplicationWithJob()],
        total: 1,
      });

      const response = await request(app)
        .get('/api/v1/applications/me')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });
  });
});
