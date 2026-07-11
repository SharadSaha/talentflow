import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import JobsManagementPage from '@/features/hr/pages/JobsManagementPage';
import { makeJob, makeMeta } from '@/test/fixtures';
import { renderWithProviders } from '@/test/test-utils';
import type { Job } from '@/types/job';

function mockHrJobs(jobs: Job[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: 'ok',
          data: jobs,
          meta: makeMeta({ total: jobs.length, totalPages: jobs.length > 0 ? 1 : 0 }),
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    ),
  );
}

function renderJobs() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/hr/jobs']}>
      <JobsManagementPage />
    </MemoryRouter>,
  );
}

describe('JobsManagementPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the header and a create action', () => {
    mockHrJobs([]);
    renderJobs();
    expect(screen.getByRole('heading', { level: 1, name: /jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create job/i })).toBeInTheDocument();
  });

  it('renders a row for each of the HR user’s jobs', async () => {
    mockHrJobs([makeJob({ id: 'j1', title: 'Staff Platform Engineer' })]);
    renderJobs();
    expect(await screen.findByText('Staff Platform Engineer')).toBeInTheDocument();
  });

  it('shows an empty state when there are no jobs', async () => {
    mockHrJobs([]);
    renderJobs();
    await waitFor(() =>
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { level: 1, name: /jobs/i })).toBeInTheDocument();
  });
});
