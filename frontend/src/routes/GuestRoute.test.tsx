import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { GuestRoute } from '@/routes/GuestRoute';
import { renderWithProviders } from '@/test/test-utils';
import type { AuthState } from '@/reducers/authSlice';
import type { User } from '@/types/user';

const candidate: User = {
  id: '1',
  email: 'candidate@talentflow.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  role: USER_ROLE.CANDIDATE,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderGuest(auth: AuthState) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[ROUTES.AUTH.CANDIDATE_LOGIN]}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.AUTH.CANDIDATE_LOGIN} element={<div>Login screen</div>} />
        </Route>
        <Route path={ROUTES.CANDIDATE.DASHBOARD} element={<div>Candidate dashboard</div>} />
      </Routes>
    </MemoryRouter>,
    { preloadedState: { auth } },
  );
}

describe('GuestRoute', () => {
  it('renders guest content for an unauthenticated visitor', () => {
    renderGuest({ user: null, token: null, status: 'unauthenticated' });
    expect(screen.getByText('Login screen')).toBeInTheDocument();
  });

  it('redirects an authenticated user to their role home', () => {
    renderGuest({ user: candidate, token: 't', status: 'authenticated' });
    expect(screen.getByText('Candidate dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login screen')).not.toBeInTheDocument();
  });
});
