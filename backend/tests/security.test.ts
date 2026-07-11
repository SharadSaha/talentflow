jest.mock('@/modules/auth/auth.repository', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createCandidate: jest.fn(),
  },
}));

import request from 'supertest';

import { createApp } from '@/app';
import { signAccessToken } from '@/auth/token.service';
import { env } from '@/config/env';
import { UserRole } from '@/generated/prisma/enums';
import { userRepository } from '@/modules/auth/auth.repository';

const mockedRepository = userRepository as jest.Mocked<typeof userRepository>;
const app = createApp();

const candidateToken = signAccessToken({
  id: '019f0000-0000-7000-8000-000000000001',
  email: 'candidate@example.com',
  role: UserRole.CANDIDATE,
});

describe('Security controls', () => {
  describe('Authentication', () => {
    it('rejects an unauthenticated request to a protected route with 401', async () => {
      const response = await request(app).get('/api/v1/jobs');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({ success: false });
    });

    it('rejects a malformed/garbage bearer token with 401', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not-a-real-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization (RBAC)', () => {
    it('forbids a candidate from reaching an HR-only route with 403', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/hr')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Input validation', () => {
    it('rejects an invalid query parameter with 422', async () => {
      const response = await request(app)
        .get('/api/v1/jobs?sortBy=passwordHash')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('Brute-force protection', () => {
    it('rate-limits repeated failed login attempts with 429', async () => {
      // Unknown email → the service throws a generic 401 for every attempt.
      mockedRepository.findByEmail.mockResolvedValue(null);

      const attempts = env.AUTH_RATE_LIMIT_MAX + 1;
      const credentials = { email: 'attacker@example.com', password: 'Wrong@Pass1' };

      const statuses: number[] = [];
      for (let i = 0; i < attempts; i += 1) {
        // Sequential requests so the limiter counter is deterministic.
        const response = await request(app).post('/api/v1/auth/login').send(credentials);
        statuses.push(response.status);
      }

      expect(statuses[0]).toBe(401);
      expect(statuses.at(-1)).toBe(429);
    });
  });
});
