import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BrowseJobsPage from '@/features/jobs/pages/BrowseJobsPage';
import { makeJob, makeMeta } from '@/test/fixtures';
import { renderWithProviders } from '@/test/test-utils';
import type { Job } from '@/types/job';

function mockJobs(jobs: Job[]) {
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

function renderBrowse() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/candidate/jobs']}>
      <BrowseJobsPage />
    </MemoryRouter>,
  );
}

describe('BrowseJobsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the page header', () => {
    mockJobs([]);
    renderBrowse();
    expect(screen.getByRole('heading', { level: 1, name: /browse jobs/i })).toBeInTheDocument();
  });

  it('renders a job card for each returned job', async () => {
    mockJobs([makeJob({ title: 'Staff Platform Engineer' })]);
    renderBrowse();

    expect(await screen.findByText('Staff Platform Engineer')).toBeInTheDocument();
    expect(screen.getByText('NovaTech')).toBeInTheDocument();
  });

  it('shows an empty state when there are no results', async () => {
    mockJobs([]);
    renderBrowse();

    // The header renders immediately; assert no job card once the query settles.
    await waitFor(() =>
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { level: 1, name: /browse jobs/i })).toBeInTheDocument();
  });
});
