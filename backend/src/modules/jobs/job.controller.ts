import { requireAuthUser } from '@/auth/require-auth-user';
import { sendPaginated, sendSuccess } from '@/common/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import type { RequestWithBody } from '@/types/http';
import { asyncHandler } from '@/utils/async-handler';
import { getValidatedParams, getValidatedQuery } from '@/utils/validated-request';

import { jobService } from './job.service';
import type { CreateJobInput, JobListQueryInput, UpdateJobInput } from './job.schemas';

interface JobIdParams {
  id: string;
}

/**
 * Creates a job posting.
 *
 * @route POST /api/v1/jobs
 * @access HR only
 */
export const createJob = asyncHandler<RequestWithBody<CreateJobInput>>(async (req, res) => {
  const authUser = requireAuthUser(req);
  const job = await jobService.createJob(authUser.id, req.body);
  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Job created successfully.',
    data: { job },
  });
});

/**
 * Browses live jobs with pagination, sorting, search, and filtering.
 *
 * @route GET /api/v1/jobs
 * @access Authenticated (HR or Candidate)
 */
export const browseJobs = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<JobListQueryInput>(req);
  const { items, meta } = await jobService.browseJobs(query);
  sendPaginated(res, { message: 'Jobs fetched successfully.', data: items, meta });
});

/**
 * Lists the authenticated HR user's own jobs (any status).
 *
 * @route GET /api/v1/hr/jobs
 * @access HR only
 */
export const getHrJobs = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const query = getValidatedQuery<JobListQueryInput>(req);
  const { items, meta } = await jobService.getHrJobs(authUser.id, query);
  sendPaginated(res, { message: 'Jobs fetched successfully.', data: items, meta });
});

/**
 * Returns a single job's details.
 *
 * @route GET /api/v1/jobs/:id
 * @access Authenticated (HR or Candidate)
 */
export const getJobById = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const { id } = getValidatedParams<JobIdParams>(req);
  const job = await jobService.getJobById(id, authUser);
  sendSuccess(res, { message: 'Job fetched successfully.', data: { job } });
});

/**
 * Updates a job (edit or close). Closing a job is `status: "CLOSED"`.
 *
 * @route PATCH /api/v1/jobs/:id
 * @access HR only (owner)
 */
export const updateJob = asyncHandler<RequestWithBody<UpdateJobInput>>(async (req, res) => {
  const authUser = requireAuthUser(req);
  const { id } = getValidatedParams<JobIdParams>(req);
  const job = await jobService.updateJob(authUser.id, id, req.body);
  sendSuccess(res, { message: 'Job updated successfully.', data: { job } });
});

/**
 * Soft-deletes a job (applications are preserved).
 *
 * @route DELETE /api/v1/jobs/:id
 * @access HR only (owner)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const { id } = getValidatedParams<JobIdParams>(req);
  await jobService.deleteJob(authUser.id, id);
  sendSuccess(res, { message: 'Job deleted successfully.', data: { id } });
});
