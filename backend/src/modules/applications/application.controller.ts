import { requireAuthUser } from '@/auth/require-auth-user';
import { sendPaginated, sendSuccess } from '@/common/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import type { RequestWithBody } from '@/types/http';
import { asyncHandler } from '@/utils/async-handler';
import { getValidatedParams, getValidatedQuery } from '@/utils/validated-request';

import { applicationService } from './application.service';
import type {
  ApplyInput,
  JobApplicantsQueryInput,
  MyApplicationsQueryInput,
  UpdateStatusInput,
} from './application.schemas';

interface IdParams {
  id: string;
}

/**
 * Applies the authenticated candidate to a job.
 *
 * @route POST /api/v1/applications
 * @access Candidate only
 */
export const apply = asyncHandler<RequestWithBody<ApplyInput>>(async (req, res) => {
  const authUser = requireAuthUser(req);
  const application = await applicationService.apply(authUser.id, req.body);
  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Application submitted successfully.',
    data: { application },
  });
});

/**
 * Lists the authenticated candidate's own applications ("Applied Jobs").
 *
 * @route GET /api/v1/applications/me
 * @access Candidate only
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const query = getValidatedQuery<MyApplicationsQueryInput>(req);
  const { items, meta } = await applicationService.getMyApplications(authUser.id, query);
  sendPaginated(res, { message: 'Applications fetched successfully.', data: items, meta });
});

/**
 * Lists the applicants for a job the authenticated HR user owns.
 *
 * @route GET /api/v1/jobs/:id/applications
 * @access HR only (job owner)
 */
export const getJobApplicants = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const { id } = getValidatedParams<IdParams>(req);
  const query = getValidatedQuery<JobApplicantsQueryInput>(req);
  const { items, meta } = await applicationService.getJobApplicants(authUser.id, id, query);
  sendPaginated(res, { message: 'Applicants fetched successfully.', data: items, meta });
});

/**
 * Updates an applicant's status (moves them through the hiring pipeline).
 *
 * @route PATCH /api/v1/applications/:id/status
 * @access HR only (job owner)
 */
export const updateApplicationStatus = asyncHandler<RequestWithBody<UpdateStatusInput>>(
  async (req, res) => {
    const authUser = requireAuthUser(req);
    const { id } = getValidatedParams<IdParams>(req);
    const application = await applicationService.updateStatus(authUser.id, id, req.body);
    sendSuccess(res, {
      message: 'Application status updated successfully.',
      data: { application },
    });
  },
);

/**
 * Withdraws the authenticated candidate's own application.
 *
 * @route PATCH /api/v1/applications/:id/withdraw
 * @access Candidate only (application owner)
 */
export const withdrawApplication = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const { id } = getValidatedParams<IdParams>(req);
  const application = await applicationService.withdraw(authUser.id, id);
  sendSuccess(res, { message: 'Application withdrawn successfully.', data: { application } });
});
