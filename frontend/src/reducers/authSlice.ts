import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { setCredentials, setAuthStatus, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthUser = (state: RootState): User | null => state.auth.user;
export const selectAuthStatus = (state: RootState): AuthStatus => state.auth.status;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.status === 'authenticated';
export const selectUserRole = (state: RootState) => state.auth.user?.role ?? null;
