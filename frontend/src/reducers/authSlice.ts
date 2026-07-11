import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { USER_ROLE, type UserRole } from '@/constants/roles';
import type { RootState } from '@/store/types';
import type { User } from '@/types/user';

/**
 * Global authentication state (client state — the user identity and session
 * status). Server data is fetched via RTK Query; this slice only holds the
 * derived session the rest of the app reads synchronously.
 *
 * `status` is a discriminated lifecycle rather than boolean flags so consumers
 * can distinguish "still bootstrapping" from "definitely signed out".
 */
export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
};

interface Credentials {
  user: User;
  token: string;
}

function resetToSignedOut(state: AuthState): void {
  state.user = null;
  state.token = null;
  state.status = 'unauthenticated';
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'authenticated';
    },
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    /** Deliberate sign-out initiated by the user. */
    clearCredentials(state) {
      resetToSignedOut(state);
    },
    /**
     * Session invalidated by the server (401). Behaves like a sign-out but is a
     * distinct action so middleware can surface a "session expired" message.
     */
    sessionExpired(state) {
      resetToSignedOut(state);
    },
  },
});

export const { setCredentials, setAuthStatus, clearCredentials, sessionExpired } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthUser = (state: RootState): User | null => state.auth.user;
export const selectAuthStatus = (state: RootState): AuthStatus => state.auth.status;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.status === 'authenticated';
export const selectUserRole = (state: RootState): UserRole | null => state.auth.user?.role ?? null;
export const selectIsHr = (state: RootState): boolean => state.auth.user?.role === USER_ROLE.HR;
export const selectIsCandidate = (state: RootState): boolean =>
  state.auth.user?.role === USER_ROLE.CANDIDATE;
