import { API_ENDPOINTS } from '@/constants/api';
import type {
  Applicant,
  ApplicantsQueryParams,
  JobApplicantsParams,
  UpdateApplicationStatusRequest,
} from '@/types/applicant';
import { baseApi, CACHE_TAGS } from '@/services/api/baseApi';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Paginated } from '@/types/pagination';
import { buildQueryString } from '@/utils/query-string';

/** Serialises applicant filters into a query string (skills as CSV, jobId in path). */
function toApplicantsQueryString(params: JobApplicantsParams): string {
  const { jobId: _jobId, skills, ...rest } = params;
  return buildQueryString({
    ...rest,
    skills: skills && skills.length > 0 ? skills.join(',') : undefined,
  });
}

/** Serialises the cross-job (All Jobs) applicant filters into a query string. */
function toHrApplicantsQueryString(params: ApplicantsQueryParams): string {
  const { skills, ...rest } = params;
  return buildQueryString({
    ...rest,
    skills: skills && skills.length > 0 ? skills.join(',') : undefined,
  });
}

/**
 * HR applicant endpoints: the applicant board for a job (with filters) and the
 * status-advance mutation. A status change invalidates the applicant list and
 * the HR dashboard so counts and pipelines refresh.
 */
export const hrApplicantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobApplicants: builder.query<Paginated<Applicant>, JobApplicantsParams>({
      query: (params) => {
        const queryString = toApplicantsQueryString(params);
        const base = API_ENDPOINTS.JOBS.applicants(params.jobId);
        return queryString ? `${base}?${queryString}` : base;
      },
      transformResponse: (response: ApiPaginatedResponse<Applicant>) => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.items.map(
                (applicant) => ({ type: CACHE_TAGS.Application, id: applicant.id }) as const,
              ),
              { type: CACHE_TAGS.Application, id: `JOB_${arg.jobId}` } as const,
            ]
          : [{ type: CACHE_TAGS.Application, id: `JOB_${arg.jobId}` } as const],
    }),

    getHrApplicants: builder.query<Paginated<Applicant>, ApplicantsQueryParams>({
      query: (params) => {
        const queryString = toHrApplicantsQueryString(params);
        const base = API_ENDPOINTS.APPLICATIONS.HR_APPLICANTS;
        return queryString ? `${base}?${queryString}` : base;
      },
      transformResponse: (response: ApiPaginatedResponse<Applicant>) => ({
        items: response.data,
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(
                (applicant) => ({ type: CACHE_TAGS.Application, id: applicant.id }) as const,
              ),
              { type: CACHE_TAGS.Application, id: 'HR_ALL' } as const,
            ]
          : [{ type: CACHE_TAGS.Application, id: 'HR_ALL' } as const],
    }),

    updateApplicationStatus: builder.mutation<Applicant, UpdateApplicationStatusRequest>({
      query: ({ applicationId, status, note }) => ({
        url: API_ENDPOINTS.APPLICATIONS.status(applicationId),
        method: 'PATCH',
        body: { status, ...(note ? { note } : {}) },
      }),
      transformResponse: (response: ApiSuccessResponse<{ application: Applicant }>) =>
        response.data.application,
      invalidatesTags: (_result, _error, { applicationId }) => [
        { type: CACHE_TAGS.Application, id: applicationId },
        { type: CACHE_TAGS.Application, id: 'LIST' },
        { type: CACHE_TAGS.Application, id: 'HR_ALL' },
        { type: CACHE_TAGS.Dashboard, id: 'HR' },
      ],
    }),
  }),
});

export const {
  useGetJobApplicantsQuery,
  useGetHrApplicantsQuery,
  useUpdateApplicationStatusMutation,
} = hrApplicantsApi;
