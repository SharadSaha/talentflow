import { API_ENDPOINTS } from '@/constants/api';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiSuccessResponse } from '@/types/api';
import type { CandidateProfile } from '@/types/profile';

/**
 * Profile endpoints injected into the base API. The infrastructure provides the
 * current candidate's profile query; mutations are added with the profile
 * feature. Extends the same base API — no separate client.
 */
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<CandidateProfile, void>({
      query: () => API_ENDPOINTS.PROFILE.ROOT,
      transformResponse: (response: ApiSuccessResponse<CandidateProfile>) => response.data,
      providesTags: [CACHE_TAGS.Profile],
    }),
  }),
});

export const { useGetMyProfileQuery, useLazyGetMyProfileQuery } = profileApi;
