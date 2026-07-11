jest.mock('@/modules/health/health.repository', () => ({
  healthRepository: {
    checkDatabase: jest.fn().mockResolvedValue(true),
  },
}));

import request from 'supertest';

import { createApp } from '@/app';
import { healthRepository } from '@/modules/health/health.repository';

const mockedRepository = healthRepository as jest.Mocked<typeof healthRepository>;
const app = createApp();

describe('Infrastructure', () => {
  describe('GET /health', () => {
    it('returns a structured ok payload when the database is up', async () => {
      mockedRepository.checkDatabase.mockResolvedValue(true);

      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        checks: { database: 'up', redis: 'disabled' },
      });
      expect(typeof res.body.uptime).toBe('number');
      expect(typeof res.body.timestamp).toBe('string');
    });

    it('returns 503 and degraded status when the database is down', async () => {
      mockedRepository.checkDatabase.mockResolvedValue(false);

      const res = await request(app).get('/health');

      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({
        status: 'degraded',
        checks: { database: 'down', redis: 'disabled' },
      });
    });
  });

  describe('GET /version', () => {
    it('returns version, environment, timestamp, and commit', async () => {
      const res = await request(app).get('/version');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        version: expect.any(String),
        environment: 'test',
        commit: expect.any(String),
      });
      expect(typeof res.body.timestamp).toBe('string');
    });
  });

  it('unknown routes return a consistent 404 error shape', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: expect.any(String), errors: [] });
  });
});
