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
/** Cache key for the browse list: every filter/sort arg EXCEPT the page, so
 *  successive pages of the same query accumulate into one cache entry. */
function serializeJobsCacheKey(params: JobListParams): string {
  const { page: _page, ...rest } = params;
  return toJobsQueryString(rest);
}

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
      // Infinite scroll: one cache entry per filter/sort combination; page 1
      // replaces, later pages append (de-duplicated). A page change on the same
      // filters forces a refetch that feeds `merge`.
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        `${endpointName}(${serializeJobsCacheKey(queryArgs)})`,
      merge: (currentCache, incoming, { arg }) => {
        if ((arg.page ?? 1) <= 1) {
          currentCache.items = incoming.items;
        } else {
          const seen = new Set(currentCache.items.map((job) => job.id));
          currentCache.items.push(...incoming.items.filter((job) => !seen.has(job.id)));
        }
        currentCache.meta = incoming.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((job) => ({ type: CACHE_TAGS.Job, id: job.id }) as const),
              { type: CACHE_TAGS.Job, id: 'LIST' } as const,
            ]
          : [{ type: CACHE_TAGS.Job, id: 'LIST' } as const],
    }),

    getJob: builder.query<Job, string>({
      // The endpoint wraps the payload as `data: { job }`.
      query: (id) => API_ENDPOINTS.JOBS.byId(id),
      transformResponse: (response: ApiSuccessResponse<{ job: Job }>) => response.data.job,
      providesTags: (_result, _error, id) => [{ type: CACHE_TAGS.Job, id }],
    }),
  }),
});

export const { useGetJobsQuery, useGetJobQuery, useLazyGetJobQuery } = jobsApi;
