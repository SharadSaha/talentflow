import { API_ENDPOINTS } from '@/constants/api';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiSuccessResponse } from '@/types/api';
import type { AuthResult, User } from '@/types/user';

/**
 * Authentication endpoints injected into the base API. Mutations return the
 * `AuthResult` (user + access token); the auth hooks own the side effects
 * (token persistence, storing credentials, redirect, toasts) so this layer
 * stays a thin, typed transport. Demonstrates the canonical `injectEndpoints`
 * pattern every feature follows.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResult, LoginRequest>({
      query: (body) => ({ url: API_ENDPOINTS.AUTH.LOGIN, method: 'POST', body }),
      transformResponse: (response: ApiSuccessResponse<AuthResult>) => response.data,
    }),

    register: builder.mutation<AuthResult, RegisterRequest>({
      query: (body) => ({ url: API_ENDPOINTS.AUTH.REGISTER, method: 'POST', body }),
      transformResponse: (response: ApiSuccessResponse<AuthResult>) => response.data,
    }),

    getMe: builder.query<User, void>({
      query: () => API_ENDPOINTS.AUTH.ME,
      transformResponse: (response: ApiSuccessResponse<User>) => response.data,
      providesTags: [CACHE_TAGS.CurrentUser],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
