import request from 'supertest';
import { createApp } from '@/app';

const app = createApp();

describe('Infrastructure', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'talentflow-backend' });
  });

  it('GET /api returns the placeholder message', async () => {
    const res = await request(app).get('/api');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('unknown routes return 404', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});
