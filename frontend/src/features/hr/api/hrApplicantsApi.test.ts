import { afterEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_STATUS } from '@/constants/application-status';
import { hrApplicantsApi } from '@/features/hr/api/hrApplicantsApi';
import { makeApplicant, makeMeta } from '@/test/fixtures';
import { makeStore } from '@/store';

function mockOnce(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('hrApplicantsApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests a job’s applicants and unwraps the paginated list', async () => {
    const fetchMock = mockOnce({
      success: true,
      message: 'ok',
      data: [makeApplicant()],
      meta: makeMeta({ total: 1, totalPages: 1 }),
    });
    const store = makeStore();

    const result = await store.dispatch(
      hrApplicantsApi.endpoints.getJobApplicants.initiate({
        jobId: 'job-1',
        status: APPLICATION_STATUS.APPLIED,
      }),
    );

    expect(result.data?.items).toHaveLength(1);
    const url =
      fetchMock.mock.calls[0][0] instanceof Request
        ? (fetchMock.mock.calls[0][0] as Request).url
        : String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/jobs/job-1/applications');
    expect(url).toContain('status=APPLIED');
  });

  it('unwraps the updated application from the status-update envelope', async () => {
    const updated = makeApplicant({ status: APPLICATION_STATUS.SHORTLISTED });
    mockOnce({ success: true, message: 'ok', data: { application: updated } });
    const store = makeStore();

    const result = await store.dispatch(
      hrApplicantsApi.endpoints.updateApplicationStatus.initiate({
        applicationId: 'app-1',
        status: APPLICATION_STATUS.SHORTLISTED,
      }),
    );

    expect(result.data?.status).toBe(APPLICATION_STATUS.SHORTLISTED);
  });
});
