import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ApplicantsPage from '@/features/hr/pages/ApplicantsPage';
import { makeApplicant, makeJob, makeMeta } from '@/test/fixtures';
import { renderWithProviders } from '@/test/test-utils';

/** Routes `/hr/jobs` → the job list (selector), `/applications` → a job's applicants. */
function mockApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
      const body = url.includes('/applications')
        ? {
            success: true,
            message: 'ok',
            data: [makeApplicant()],
            meta: makeMeta({ total: 1, totalPages: 1 }),
          }
        : {
            success: true,
            message: 'ok',
            data: [makeJob({ id: 'job-1', title: 'Senior Frontend Engineer' })],
            meta: makeMeta({ total: 1, totalPages: 1 }),
          };
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );
    }),
  );
}

function renderApplicants(path: string) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <ApplicantsPage />
    </MemoryRouter>,
  );
}

describe('ApplicantsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('defaults to "All Jobs" and lists applicants across every job', async () => {
    mockApi();
    renderApplicants('/hr/applicants');

    expect(screen.getByRole('heading', { level: 1, name: /applicants/i })).toBeInTheDocument();
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('lists applicants for a selected job', async () => {
    mockApi();
    renderApplicants('/hr/applicants?job=job-1');

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  });
});
