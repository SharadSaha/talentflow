import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_STATUS } from '@/constants/application-status';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { USER_ROLE } from '@/constants/roles';
import { AuthBootstrap } from '@/providers/AuthBootstrap';
import { ThemeProvider } from '@/providers/theme/ThemeProvider';
import { routes } from '@/routes/route-config';
import { makeHrDashboard } from '@/test/fixtures';
import { makeStore } from '@/store';
import type { CandidateDashboard } from '@/types/dashboard';

const candidate = {
  id: '1',
  email: 'candidate@talentflow.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  role: USER_ROLE.CANDIDATE,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const hr = {
  id: '2',
  email: 'hr@talentflow.test',
  firstName: 'Grace',
  lastName: 'Hopper',
  role: USER_ROLE.HR,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const emptyDashboard: CandidateDashboard = {
  profileCompletion: 40,
  applicationCounts: {
    total: 0,
    byStatus: {
      [APPLICATION_STATUS.APPLIED]: 0,
      [APPLICATION_STATUS.UNDER_REVIEW]: 0,
      [APPLICATION_STATUS.SHORTLISTED]: 0,
      [APPLICATION_STATUS.INTERVIEW]: 0,
      [APPLICATION_STATUS.OFFERED]: 0,
      [APPLICATION_STATUS.HIRED]: 0,
      [APPLICATION_STATUS.REJECTED]: 0,
      [APPLICATION_STATUS.WITHDRAWN]: 0,
    },
  },
  recentApplications: [],
  recommendedJobs: [],
  recentJobs: [],
  savedCount: 0,
};

/** Stubs `fetch`, routing responses by URL substring. */
function mockApi(handlers: { match: string; data: unknown; status?: number }[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
      const handler = handlers.find((h) => url.includes(h.match));
      const status = handler?.status ?? (handler ? 200 : 404);
      const body = JSON.stringify({
        success: status < 400,
        message: 'ok',
        data: handler?.data ?? null,
      });
      return Promise.resolve(
        new Response(body, { status, headers: { 'content-type': 'application/json' } }),
      );
    }),
  );
}

/**
 * Renders the real route tree through the full bootstrap flow (AuthBootstrap +
 * guards), mirroring how the app boots in the browser.
 */
function renderApp(path: string, options: { token?: string } = {}) {
  if (options.token) {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, options.token);
  }
  const store = makeStore();
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  render(
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
      </ThemeProvider>
    </ReduxProvider>,
  );
}

describe('AppRouter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('sends the legacy /login path to the candidate login form', async () => {
    renderApp('/login');
    expect(await screen.findByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('renders the candidate login page at /auth/candidate/login', async () => {
    renderApp('/auth/candidate/login');
    expect(await screen.findByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('renders the public landing at /', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { name: /keeps pace with your team/i }),
    ).toBeInTheDocument();
  });

  it('redirects an unauthenticated visitor away from a protected route to login', async () => {
    renderApp('/candidate/dashboard');
    expect(await screen.findByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('restores an authenticated session and lands on the candidate dashboard', async () => {
    mockApi([
      // Single-object endpoints wrap the payload under a named key.
      { match: '/auth/me', data: { user: candidate } },
      { match: '/dashboard/candidate', data: { dashboard: emptyDashboard } },
    ]);
    renderApp('/candidate/dashboard', { token: 'valid-token' });

    expect(
      await screen.findByRole('heading', { level: 1, name: /dashboard/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it('sends an authenticated HR user into the HR portal', async () => {
    mockApi([
      { match: '/auth/me', data: { user: hr } },
      { match: '/dashboard/hr', data: { dashboard: makeHrDashboard() } },
    ]);
    renderApp('/hr/dashboard', { token: 'valid-token' });

    expect(
      await screen.findByRole('heading', { level: 1, name: /dashboard/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it('blocks an HR user from candidate routes with an unauthorized page', async () => {
    mockApi([{ match: '/auth/me', data: { user: hr } }]);
    renderApp('/candidate/dashboard', { token: 'valid-token' });

    expect(await screen.findByText(/access denied/i)).toBeInTheDocument();
  });
});
