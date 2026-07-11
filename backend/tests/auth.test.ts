jest.mock('@/modules/auth/auth.repository', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createCandidate: jest.fn(),
  },
}));

import request from 'supertest';

import { createApp } from '@/app';
import { hashPassword } from '@/auth/password.service';
import { signAccessToken } from '@/auth/token.service';
import { userRepository } from '@/modules/auth/auth.repository';

import { buildUser } from './fixtures';

const mockedRepository = userRepository as jest.Mocked<typeof userRepository>;
const app = createApp();

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    const validBody = {
      email: 'new.user@example.com',
      password: 'Str0ng@Pass',
      firstName: 'New',
      lastName: 'User',
    };

    it('registers a candidate and returns the user with an access token', async () => {
      mockedRepository.findByEmail.mockResolvedValue(null);
      mockedRepository.createCandidate.mockResolvedValue(buildUser({ email: validBody.email }));

      const response = await request(app).post('/api/v1/auth/register').send(validBody);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ success: true, message: expect.any(String) });
      expect(response.body.data.user.email).toBe(validBody.email);
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data.accessToken).toEqual(expect.any(String));
    });

    it('returns 422 with field errors for an invalid body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'weak', firstName: '', lastName: '' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(mockedRepository.createCandidate).not.toHaveBeenCalled();
    });

    it('returns 409 when the email already exists', async () => {
      mockedRepository.findByEmail.mockResolvedValue(buildUser({ email: validBody.email }));

      const response = await request(app).post('/api/v1/auth/register').send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const password = 'Str0ng@Pass';

    it('returns a token for valid credentials', async () => {
      const passwordHash = await hashPassword(password);
      mockedRepository.findByEmail.mockResolvedValue(
        buildUser({ email: 'candidate@example.com', passwordHash }),
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'candidate@example.com', password });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toEqual(expect.any(String));
    });

    it('returns 401 for invalid credentials', async () => {
      mockedRepository.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'candidate@example.com', password });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 401 when no token is provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('returns the authenticated user for a valid token', async () => {
      const user = buildUser();
      mockedRepository.findById.mockResolvedValue(user);
      const token = signAccessToken({ id: user.id, email: user.email, role: user.role });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });
  });
});
