import { API_ENDPOINTS } from '@/constants/api';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiSuccessResponse } from '@/types/api';
import type { CandidateDashboard } from '@/types/dashboard';

/**
 * Dashboard endpoints. The candidate dashboard aggregates profile completion,
 * application counts, and recommended/recent jobs in one call; it is tagged so
 * applying, withdrawing, or editing the profile refreshes it automatically.
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCandidateDashboard: builder.query<CandidateDashboard, void>({
      // The endpoint wraps the payload as `data: { dashboard }`.
      query: () => API_ENDPOINTS.DASHBOARD.CANDIDATE,
      transformResponse: (response: ApiSuccessResponse<{ dashboard: CandidateDashboard }>) =>
        response.data.dashboard,
      providesTags: [{ type: CACHE_TAGS.Dashboard, id: 'CANDIDATE' }],
    }),
  }),
});

export const { useGetCandidateDashboardQuery } = dashboardApi;
