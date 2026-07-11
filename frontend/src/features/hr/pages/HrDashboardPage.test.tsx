import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HrDashboardPage from '@/features/hr/pages/HrDashboardPage';
import { makeHrDashboard } from '@/test/fixtures';
import { renderWithProviders } from '@/test/test-utils';

function mockDashboard(status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: status < 400,
          message: 'ok',
          data: { dashboard: makeHrDashboard() },
        }),
        { status, headers: { 'content-type': 'application/json' } },
      ),
    ),
  );
}

function renderDashboard() {
  return renderWithProviders(
    <MemoryRouter>
      <HrDashboardPage />
    </MemoryRouter>,
  );
}

describe('HrDashboardPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the page header once loaded', async () => {
    mockDashboard();
    renderDashboard();
    expect(
      await screen.findByRole('heading', { level: 1, name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('renders headline metrics from the dashboard payload', async () => {
    mockDashboard();
    renderDashboard();

    // Total applicants (42) from the fixture.
    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText(/total applicants/i)).toBeInTheDocument();
  });

  it('shows an error state with a retry when the request fails', async () => {
    mockDashboard(500);
    renderDashboard();
    expect(await screen.findByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
