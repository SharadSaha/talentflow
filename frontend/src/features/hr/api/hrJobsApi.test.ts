import { afterEach, describe, expect, it, vi } from 'vitest';

import { EMPLOYMENT_TYPE, EXPERIENCE_LEVEL, SALARY_PERIOD, WORK_MODE } from '@/constants/job';
import { JOB_STATUS } from '@/constants/job-status';
import { hrJobsApi } from '@/features/hr/api/hrJobsApi';
import type { CreateJobRequest } from '@/features/hr/types/hr-job.types';
import { makeJob, makeMeta } from '@/test/fixtures';
import { makeStore } from '@/store';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function mockOnce(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(body, status));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const newJob: CreateJobRequest = {
  title: 'Senior Backend Engineer',
  description: 'Build APIs.',
  employmentType: EMPLOYMENT_TYPE.FULL_TIME,
  experienceLevel: EXPERIENCE_LEVEL.SENIOR,
  workMode: WORK_MODE.REMOTE,
  salaryPeriod: SALARY_PERIOD.YEARLY,
  openings: 2,
  status: JOB_STATUS.PUBLISHED,
  skills: [{ slug: 'nodejs', isRequired: true }],
};

describe('hrJobsApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('unwraps the paginated HR jobs list', async () => {
    const jobs = [makeJob({ id: 'j1' }), makeJob({ id: 'j2', status: JOB_STATUS.DRAFT })];
    mockOnce({
      success: true,
      message: 'ok',
      data: jobs,
      meta: makeMeta({ total: 2, totalPages: 1 }),
    });
    const store = makeStore();

    const result = await store.dispatch(hrJobsApi.endpoints.getHrJobs.initiate({}));

    expect(result.data?.items).toHaveLength(2);
    expect(result.data?.meta.total).toBe(2);
  });

  it('sends the HR jobs request to the /hr/jobs endpoint with query params', async () => {
    const fetchMock = mockOnce({ success: true, message: 'ok', data: [], meta: makeMeta() });
    const store = makeStore();

    await store.dispatch(hrJobsApi.endpoints.getHrJobs.initiate({ status: JOB_STATUS.CLOSED }));

    const url = String(
      (fetchMock.mock.calls[0][0] as Request | string) instanceof Request
        ? (fetchMock.mock.calls[0][0] as Request).url
        : fetchMock.mock.calls[0][0],
    );
    expect(url).toContain('/hr/jobs');
    expect(url).toContain('status=CLOSED');
  });

  it('unwraps the created job from the { job } envelope', async () => {
    const created = makeJob({ id: 'new', title: newJob.title });
    mockOnce({ success: true, message: 'Job created.', data: { job: created } }, 201);
    const store = makeStore();

    const result = await store.dispatch(hrJobsApi.endpoints.createJob.initiate(newJob));

    expect(result.data).toEqual(created);
  });

  it('unwraps the deleted job id', async () => {
    mockOnce({ success: true, message: 'Job deleted.', data: { id: 'j1' } });
    const store = makeStore();

    const result = await store.dispatch(hrJobsApi.endpoints.deleteJob.initiate('j1'));

    expect(result.data).toEqual({ id: 'j1' });
  });
});
