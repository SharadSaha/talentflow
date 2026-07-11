import { API_ENDPOINTS } from '@/constants/api';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiSuccessResponse } from '@/types/api';
import type { HrDashboard } from '@/types/hr-dashboard';

/**
 * HR dashboard endpoint. Aggregates job counts, applicant totals, the status
 * breakdown, and recent activity in one call; tagged so job and applicant
 * mutations refresh it automatically.
 */
export const hrDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHrDashboard: builder.query<HrDashboard, void>({
      query: () => API_ENDPOINTS.DASHBOARD.HR,
      transformResponse: (response: ApiSuccessResponse<{ dashboard: HrDashboard }>) =>
        response.data.dashboard,
      providesTags: [{ type: CACHE_TAGS.Dashboard, id: 'HR' }],
    }),
  }),
});

export const { useGetHrDashboardQuery } = hrDashboardApi;
