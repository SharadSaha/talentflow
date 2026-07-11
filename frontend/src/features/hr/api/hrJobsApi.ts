import { API_ENDPOINTS } from '@/constants/api';
import type {
  CreateJobRequest,
  HrJobsParams,
  UpdateJobRequest,
} from '@/features/hr/types/hr-job.types';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Job } from '@/types/job';
import type { Paginated } from '@/types/pagination';
import { buildQueryString } from '@/utils/query-string';

/** Serialises HR job-list params into a query string (skills as CSV). */
function toJobsQueryString(params: HrJobsParams): string {
  const { skills, ...rest } = params;
  return buildQueryString({
    ...rest,
    skills: skills && skills.length > 0 ? skills.join(',') : undefined,
  });
}

/**
 * HR job-management endpoints: the HR user's own jobs (any status) plus create,
 * update (also close/reopen via `status`), and delete. Mutations invalidate the
 * jobs list, the affected job, and the HR dashboard so every view refreshes.
 */
export const hrJobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHrJobs: builder.query<Paginated<Job>, HrJobsParams>({
      query: (params) => {
        const queryString = toJobsQueryString(params);
        return queryString ? `${API_ENDPOINTS.HR.JOBS}?${queryString}` : API_ENDPOINTS.HR.JOBS;
      },
      transformResponse: (response: ApiPaginatedResponse<Job>) => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((job) => ({ type: CACHE_TAGS.Job, id: job.id }) as const),
              { type: CACHE_TAGS.Job, id: 'HR_LIST' } as const,
            ]
          : [{ type: CACHE_TAGS.Job, id: 'HR_LIST' } as const],
    }),

    createJob: builder.mutation<Job, CreateJobRequest>({
      query: (body) => ({ url: API_ENDPOINTS.JOBS.ROOT, method: 'POST', body }),
      transformResponse: (response: ApiSuccessResponse<{ job: Job }>) => response.data.job,
      invalidatesTags: [
        { type: CACHE_TAGS.Job, id: 'HR_LIST' },
        { type: CACHE_TAGS.Job, id: 'LIST' },
        { type: CACHE_TAGS.Dashboard, id: 'HR' },
      ],
    }),

    updateJob: builder.mutation<Job, { id: string; data: UpdateJobRequest }>({
      query: ({ id, data }) => ({ url: API_ENDPOINTS.JOBS.byId(id), method: 'PATCH', body: data }),
      transformResponse: (response: ApiSuccessResponse<{ job: Job }>) => response.data.job,
      invalidatesTags: (_result, _error, { id }) => [
        { type: CACHE_TAGS.Job, id },
        { type: CACHE_TAGS.Job, id: 'HR_LIST' },
        { type: CACHE_TAGS.Job, id: 'LIST' },
        { type: CACHE_TAGS.Dashboard, id: 'HR' },
      ],
    }),

    deleteJob: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: API_ENDPOINTS.JOBS.byId(id), method: 'DELETE' }),
      transformResponse: (response: ApiSuccessResponse<{ id: string }>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: CACHE_TAGS.Job, id },
        { type: CACHE_TAGS.Job, id: 'HR_LIST' },
        { type: CACHE_TAGS.Job, id: 'LIST' },
        { type: CACHE_TAGS.Dashboard, id: 'HR' },
      ],
    }),
  }),
});

export const {
  useGetHrJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = hrJobsApi;
