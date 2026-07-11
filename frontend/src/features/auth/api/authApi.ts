import { API_ENDPOINTS } from '@/constants/api';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiSuccessResponse } from '@/types/api';
import type { User } from '@/types/user';

/**
 * Auth endpoints injected into the base API. The foundation only needs session
 * restoration (`getMe`); login/register mutations are added with the auth
 * feature. This module also demonstrates the canonical `injectEndpoints`
 * pattern every feature follows.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => API_ENDPOINTS.AUTH.ME,
      transformResponse: (response: ApiSuccessResponse<User>) => response.data,
      providesTags: [CACHE_TAGS.CurrentUser],
    }),
  }),
});

export const { useGetMeQuery, useLazyGetMeQuery } = authApi;
