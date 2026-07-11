import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_STATUS } from '@/constants/application-status';
import { JOB_STATUS } from '@/constants/job-status';
import JobDetailsPage from '@/features/jobs/pages/JobDetailsPage';
import { makeApplication, makeJob, makeMeta } from '@/test/fixtures';
import { renderWithProviders } from '@/test/test-utils';
import type { Application } from '@/types/application';
import type { Job } from '@/types/job';

/** Routes `/jobs/:id` → the job, `/applications/me` → the candidate's applications. */
function mockJobAndApplications(job: Job, applications: Application[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
      const body = url.includes('/applications/me')
        ? {
            success: true,
            message: 'ok',
            data: applications,
            meta: makeMeta({ total: applications.length }),
          }
        : { success: true, message: 'ok', data: job };
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );
    }),
  );
}

function renderJobDetails() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/candidate/jobs/job-1']}>
      <Routes>
        <Route path="/candidate/jobs/:id" element={<JobDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('JobDetailsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows the job and an apply action for a published job not yet applied to', async () => {
    mockJobAndApplications(makeJob(), []);
    renderJobDetails();

    expect(
      await screen.findByRole('heading', { level: 1, name: /senior frontend engineer/i }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /apply now/i })).toBeInTheDocument();
  });

  it('shows the applied state when the candidate has already applied', async () => {
    mockJobAndApplications(makeJob(), [
      makeApplication({ status: APPLICATION_STATUS.UNDER_REVIEW }),
    ]);
    renderJobDetails();

    await screen.findByRole('heading', { level: 1, name: /senior frontend engineer/i });
    expect(await screen.findByText(/under review/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply now/i })).not.toBeInTheDocument();
  });

  it('disables applying to a closed job', async () => {
    mockJobAndApplications(makeJob({ status: JOB_STATUS.CLOSED }), []);
    renderJobDetails();

    await screen.findByRole('heading', { level: 1, name: /senior frontend engineer/i });
    expect(await screen.findByRole('button', { name: /apply now/i })).toBeDisabled();
  });
});
