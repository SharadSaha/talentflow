import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { renderWithProviders } from '@/test/test-utils';
import type { AuthState } from '@/reducers/authSlice';
import type { User } from '@/types/user';

const authenticatedUser: User = {
  id: '1',
  email: 'hr@talentflow.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  role: USER_ROLE.HR,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderAtProtected(auth: AuthState) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[ROUTES.DASHBOARD]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD} element={<div>Protected content</div>} />
        </Route>
        <Route path={ROUTES.LOGIN} element={<div>Login screen</div>} />
      </Routes>
    </MemoryRouter>,
    { preloadedState: { auth } },
  );
}

describe('ProtectedRoute', () => {
  it('shows a loader while the session is still bootstrapping', () => {
    renderAtProtected({ user: null, token: null, status: 'authenticating' });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to the login screen', () => {
    renderAtProtected({ user: null, token: null, status: 'unauthenticated' });

    expect(screen.getByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders the protected content for an authenticated user', () => {
    renderAtProtected({
      user: authenticatedUser,
      token: 'token-abc',
      status: 'authenticated',
    });

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
