import { afterEach, describe, expect, it, vi } from 'vitest';

import { USER_ROLE } from '@/constants/roles';
import { authApi } from '@/features/auth/api/authApi';
import { makeStore } from '@/store';
import { isFetchBaseQueryError } from '@/utils/api-error';
import type { AuthResult } from '@/types/user';

const authResult: AuthResult = {
  user: {
    id: '1',
    email: 'candidate@talentflow.test',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: USER_ROLE.CANDIDATE,
    organizationName: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  accessToken: 'token-abc',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function mockFetchOnce(body: unknown, status = 200): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body, status)));
}

describe('authApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('unwraps the user and token from the login envelope', async () => {
    mockFetchOnce({ success: true, message: 'Logged in successfully.', data: authResult });
    const store = makeStore();

    const result = await store.dispatch(
      authApi.endpoints.login.initiate({
        email: 'candidate@talentflow.test',
        password: 'Str0ng!!',
      }),
    );

    expect(result.data).toEqual(authResult);
  });

  it('surfaces a 401 as an error result on login', async () => {
    mockFetchOnce({ success: false, message: 'Invalid email or password.', errors: [] }, 401);
    const store = makeStore();

    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ email: 'candidate@talentflow.test', password: 'wrong' }),
    );

    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(isFetchBaseQueryError(result.error) && result.error.status).toBe(401);
  });

  it('unwraps the created account from the register envelope', async () => {
    mockFetchOnce(
      { success: true, message: 'Account created successfully.', data: authResult },
      201,
    );
    const store = makeStore();

    const result = await store.dispatch(
      authApi.endpoints.register.initiate({
        email: 'candidate@talentflow.test',
        password: 'Str0ng!!',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    );

    expect(result.data).toEqual(authResult);
  });

  it('unwraps the current user from the getMe envelope', async () => {
    mockFetchOnce({
      success: true,
      message: 'Current user fetched successfully.',
      data: { user: authResult.user },
    });
    const store = makeStore();

    const result = await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(result.data).toEqual(authResult.user);
  });
});
