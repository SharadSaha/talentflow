import { describe, expect, it } from 'vitest';

import { USER_ROLE } from '@/constants/roles';
import {
  authReducer,
  clearCredentials,
  selectIsAuthenticated,
  selectUserRole,
  sessionExpired,
  setAuthStatus,
  setCredentials,
  type AuthState,
} from '@/reducers/authSlice';
import type { RootState } from '@/store';
import type { User } from '@/types/user';

const user: User = {
  id: '1',
  email: 'candidate@talentflow.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  role: USER_ROLE.CANDIDATE,
  organizationName: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const authenticatedState: AuthState = { user, token: 'token-abc', status: 'authenticated' };

describe('authSlice reducer', () => {
  it('starts idle with no user or token', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ user: null, token: null, status: 'idle' });
  });

  it('stores credentials and marks the session authenticated', () => {
    const state = authReducer(undefined, setCredentials({ user, token: 'token-abc' }));
    expect(state).toEqual(authenticatedState);
  });

  it('updates the auth status in isolation', () => {
    const state = authReducer(undefined, setAuthStatus('authenticating'));
    expect(state.status).toBe('authenticating');
  });

  it('clears the session on deliberate sign-out', () => {
    const state = authReducer(authenticatedState, clearCredentials());
    expect(state).toEqual({ user: null, token: null, status: 'unauthenticated' });
  });

  it('clears the session when it expires', () => {
    const state = authReducer(authenticatedState, sessionExpired());
    expect(state).toEqual({ user: null, token: null, status: 'unauthenticated' });
  });
});

describe('auth selectors', () => {
  function buildState(auth: AuthState): RootState {
    return { auth } as RootState;
  }

  it('selectIsAuthenticated reflects the status', () => {
    expect(selectIsAuthenticated(buildState(authenticatedState))).toBe(true);
    expect(
      selectIsAuthenticated(buildState({ user: null, token: null, status: 'unauthenticated' })),
    ).toBe(false);
  });

  it('selectUserRole returns the current role or null', () => {
    expect(selectUserRole(buildState(authenticatedState))).toBe(USER_ROLE.CANDIDATE);
    expect(selectUserRole(buildState({ user: null, token: null, status: 'idle' }))).toBeNull();
  });
});
