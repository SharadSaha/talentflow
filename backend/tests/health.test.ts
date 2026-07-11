import request from 'supertest';

import { createApp } from '@/app';

const app = createApp();

describe('Infrastructure', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'talentflow-backend' });
  });

  it('unknown routes return a consistent 404 error shape', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: expect.any(String), errors: [] });
  });
});
