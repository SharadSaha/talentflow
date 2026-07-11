import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { USER_ROLE } from '@/constants/roles';
import { AuthBootstrap } from '@/providers/AuthBootstrap';
import { ThemeProvider } from '@/providers/theme/ThemeProvider';
import { routes } from '@/routes/route-config';
import { makeStore } from '@/store';

const candidate = {
  id: '1',
  email: 'candidate@talentflow.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  role: USER_ROLE.CANDIDATE,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function mockGetMe(user: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: status < 400, message: 'ok', data: user }), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    ),
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

  it('renders the login form at /login for an unauthenticated visitor', async () => {
    renderApp('/login');
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

  it('restores an authenticated session and redirects /login to the role dashboard', async () => {
    mockGetMe(candidate);
    renderApp('/login', { token: 'valid-token' });
    expect(
      await screen.findByText('Candidate Dashboard', undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
