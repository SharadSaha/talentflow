import { API_ENDPOINTS } from '@/constants/api';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Application, ApplyRequest, MyApplicationsParams } from '@/types/application';
import type { Paginated } from '@/types/pagination';
import { buildQueryString } from '@/utils/query-string';

/**
 * Application endpoints for candidates: listing their own applications, applying
 * to a job, and withdrawing. Mutations invalidate the applications list, the
 * candidate dashboard, and the affected job so every view refreshes immediately
 * after the change is confirmed by the server.
 */
export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyApplications: builder.query<Paginated<Application>, MyApplicationsParams>({
      query: (params) => {
        const queryString = buildQueryString({ ...params });
        return queryString
          ? `${API_ENDPOINTS.APPLICATIONS.MINE}?${queryString}`
          : API_ENDPOINTS.APPLICATIONS.MINE;
      },
      transformResponse: (response: ApiPaginatedResponse<Application>) => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(
                (application) => ({ type: CACHE_TAGS.Application, id: application.id }) as const,
              ),
              { type: CACHE_TAGS.Application, id: 'LIST' } as const,
            ]
          : [{ type: CACHE_TAGS.Application, id: 'LIST' } as const],
    }),

    applyToJob: builder.mutation<Application, ApplyRequest>({
      query: (body) => ({ url: API_ENDPOINTS.APPLICATIONS.ROOT, method: 'POST', body }),
      transformResponse: (response: ApiSuccessResponse<Application>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: CACHE_TAGS.Application, id: 'LIST' },
        { type: CACHE_TAGS.Dashboard, id: 'CANDIDATE' },
        { type: CACHE_TAGS.Job, id: arg.jobId },
      ],
    }),

    withdrawApplication: builder.mutation<Application, string>({
      query: (id) => ({ url: API_ENDPOINTS.APPLICATIONS.withdraw(id), method: 'PATCH' }),
      transformResponse: (response: ApiSuccessResponse<Application>) => response.data,
      invalidatesTags: (result, _error, id) => [
        { type: CACHE_TAGS.Application, id },
        { type: CACHE_TAGS.Application, id: 'LIST' },
        { type: CACHE_TAGS.Dashboard, id: 'CANDIDATE' },
        ...(result ? [{ type: CACHE_TAGS.Job, id: result.job.id } as const] : []),
      ],
    }),
  }),
});

export const { useGetMyApplicationsQuery, useApplyToJobMutation, useWithdrawApplicationMutation } =
  applicationsApi;
