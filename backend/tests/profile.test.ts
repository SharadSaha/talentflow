jest.mock('@/modules/candidate-profile/profile.repository', () => ({
  candidateProfileRepository: {
    findByUserId: jest.fn(),
    updateByUserId: jest.fn(),
  },
}));

import request from 'supertest';

import { createApp } from '@/app';
import { signAccessToken } from '@/auth/token.service';
import { UserRole } from '@/generated/prisma/enums';
import { candidateProfileRepository } from '@/modules/candidate-profile/profile.repository';

import { buildCandidateProfile } from './fixtures';

const mockedRepository = candidateProfileRepository as jest.Mocked<
  typeof candidateProfileRepository
>;
const app = createApp();

const candidateToken = signAccessToken({
  id: '019f0000-0000-7000-8000-000000000001',
  email: 'candidate@example.com',
  role: UserRole.CANDIDATE,
});

const hrToken = signAccessToken({
  id: '019f0000-0000-7000-8000-0000000000f0',
  email: 'hr@example.com',
  role: UserRole.HR,
});

describe('Candidate Profile API', () => {
  describe('GET /api/v1/profile', () => {
    it('returns the profile for an authenticated candidate', async () => {
      mockedRepository.findByUserId.mockResolvedValue(buildCandidateProfile());

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.user.email).toBe('candidate@example.com');
      expect(response.body.data.profile.skills).toHaveLength(1);
    });

    it('returns 403 for an HR user', async () => {
      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(mockedRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('returns 401 when no token is provided', async () => {
      const response = await request(app).get('/api/v1/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/profile', () => {
    it('updates the profile for an authenticated candidate', async () => {
      mockedRepository.findByUserId.mockResolvedValue(buildCandidateProfile());
      mockedRepository.updateByUserId.mockResolvedValue(
        buildCandidateProfile({ headline: 'Staff Engineer' }),
      );

      const response = await request(app)
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ headline: 'Staff Engineer' });

      expect(response.status).toBe(200);
      expect(response.body.data.profile.headline).toBe('Staff Engineer');
    });

    it('returns 422 for an unknown field (mass-assignment attempt)', async () => {
      const response = await request(app)
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ role: 'HR' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(mockedRepository.updateByUserId).not.toHaveBeenCalled();
    });

    it('returns 422 for an empty body', async () => {
      const response = await request(app)
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({});

      expect(response.status).toBe(422);
    });

    it('returns 403 for an HR user', async () => {
      const response = await request(app)
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ headline: 'Staff Engineer' });

      expect(response.status).toBe(403);
      expect(mockedRepository.updateByUserId).not.toHaveBeenCalled();
    });
  });
});
