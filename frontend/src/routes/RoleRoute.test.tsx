import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { RoleRoute } from '@/routes/RoleRoute';
import { renderWithProviders } from '@/test/test-utils';
import type { AuthState } from '@/reducers/authSlice';
import type { User } from '@/types/user';

function makeUser(role: User['role']): User {
  return {
    id: '1',
    email: 'user@talentflow.test',
    firstName: 'Grace',
    lastName: 'Hopper',
    role,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function renderHrOnlyRoute(auth: AuthState) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[ROUTES.HR.DASHBOARD]}>
      <Routes>
        <Route element={<RoleRoute allowedRoles={[USER_ROLE.HR]} />}>
          <Route path={ROUTES.HR.DASHBOARD} element={<div>HR content</div>} />
        </Route>
        <Route path={ROUTES.UNAUTHORIZED} element={<div>Unauthorized</div>} />
      </Routes>
    </MemoryRouter>,
    { preloadedState: { auth } },
  );
}

describe('RoleRoute', () => {
  it('renders the route for a user with an allowed role', () => {
    renderHrOnlyRoute({ user: makeUser(USER_ROLE.HR), token: 't', status: 'authenticated' });
    expect(screen.getByText('HR content')).toBeInTheDocument();
  });

  it('redirects a user with a disallowed role to the unauthorized page', () => {
    renderHrOnlyRoute({ user: makeUser(USER_ROLE.CANDIDATE), token: 't', status: 'authenticated' });
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    expect(screen.queryByText('HR content')).not.toBeInTheDocument();
  });

  it('shows a loader while the session is still bootstrapping', () => {
    renderHrOnlyRoute({ user: null, token: null, status: 'authenticating' });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
