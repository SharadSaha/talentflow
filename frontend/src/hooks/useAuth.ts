import { useMemo } from 'react';

import { USER_ROLE, type UserRole } from '@/constants/roles';
import { selectAuthStatus, selectAuthUser, selectIsAuthenticated } from '@/reducers/authSlice';
import { useAppSelector } from '@/store/hooks';
import type { User } from '@/types/user';

export interface AuthSnapshot {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHr: boolean;
  isCandidate: boolean;
  isBootstrapping: boolean;
}

/**
 * Read-only view of the authenticated session, derived from the auth slice.
 * Components read auth state through this hook rather than reaching into the
 * store shape directly.
 */
export function useAuth(): AuthSnapshot {
  const user = useAppSelector(selectAuthUser);
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return useMemo<AuthSnapshot>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated,
      isHr: user?.role === USER_ROLE.HR,
      isCandidate: user?.role === USER_ROLE.CANDIDATE,
      isBootstrapping: status === 'idle' || status === 'authenticating',
    }),
    [user, status, isAuthenticated],
  );
}
