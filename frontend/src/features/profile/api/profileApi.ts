import { API_ENDPOINTS } from '@/constants/api';
import type { UpdateProfileRequest } from '@/features/profile/types/profile.types';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiSuccessResponse } from '@/types/api';
import type { CandidateProfile } from '@/types/profile';

/**
 * Profile endpoints injected into the base API. Reads the current candidate's
 * profile and updates it. The update applies an optimistic patch to the cached
 * profile (rolled back on failure) and invalidates the dashboard so the profile
 * completion metric stays in sync.
 */
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<CandidateProfile, void>({
      // The endpoint wraps the payload as `data: { profile }`.
      query: () => API_ENDPOINTS.PROFILE.ROOT,
      transformResponse: (response: ApiSuccessResponse<{ profile: CandidateProfile }>) =>
        response.data.profile,
      providesTags: [CACHE_TAGS.Profile],
    }),

    updateProfile: builder.mutation<CandidateProfile, UpdateProfileRequest>({
      query: (body) => ({ url: API_ENDPOINTS.PROFILE.ROOT, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccessResponse<{ profile: CandidateProfile }>) =>
        response.data.profile,
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          profileApi.util.updateQueryData('getMyProfile', undefined, (draft) => {
            Object.assign(draft, patch);
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(profileApi.util.updateQueryData('getMyProfile', undefined, () => data));
        } catch {
          optimistic.undo();
        }
      },
      invalidatesTags: [{ type: CACHE_TAGS.Dashboard, id: 'CANDIDATE' }],
    }),
  }),
});

export const { useGetMyProfileQuery, useLazyGetMyProfileQuery, useUpdateProfileMutation } =
  profileApi;
