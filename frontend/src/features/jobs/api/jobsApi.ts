import { API_ENDPOINTS } from '@/constants/api';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Job, JobListParams } from '@/types/job';
import type { Paginated } from '@/types/pagination';
import { buildQueryString } from '@/utils/query-string';

/** Serialises browse-jobs params into a query string (skills as CSV). */
function toJobsQueryString(params: JobListParams): string {
  const { skills, ...rest } = params;
  return buildQueryString({
    ...rest,
    skills: skills && skills.length > 0 ? skills.join(',') : undefined,
  });
}

/**
 * Job endpoints injected into the base API. Browsing is candidate-facing (live
 * jobs only, server-side filtering/sort/pagination); details resolve a single
 * job. List results carry per-item + list tags so mutations elsewhere (e.g.
 * applying) can invalidate precisely.
 */
export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<Paginated<Job>, JobListParams>({
      query: (params) => {
        const queryString = toJobsQueryString(params);
        return queryString ? `${API_ENDPOINTS.JOBS.ROOT}?${queryString}` : API_ENDPOINTS.JOBS.ROOT;
      },
      transformResponse: (response: ApiPaginatedResponse<Job>) => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((job) => ({ type: CACHE_TAGS.Job, id: job.id }) as const),
              { type: CACHE_TAGS.Job, id: 'LIST' } as const,
            ]
          : [{ type: CACHE_TAGS.Job, id: 'LIST' } as const],
    }),

    getJob: builder.query<Job, string>({
      query: (id) => API_ENDPOINTS.JOBS.byId(id),
      transformResponse: (response: ApiSuccessResponse<Job>) => response.data,
      providesTags: (_result, _error, id) => [{ type: CACHE_TAGS.Job, id }],
    }),
  }),
});

export const { useGetJobsQuery, useGetJobQuery, useLazyGetJobQuery } = jobsApi;
