import { requireAuthUser } from '@/auth/require-auth-user';
import { sendSuccess } from '@/common/api-response';
import { asyncHandler } from '@/utils/async-handler';

import { dashboardService } from './dashboard.service';

/**
 * Returns the authenticated candidate's dashboard.
 *
 * @route GET /api/v1/dashboard/candidate
 * @access Candidate only
 */
export const getCandidateDashboard = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const dashboard = await dashboardService.getCandidateDashboard(authUser.id);
  sendSuccess(res, { message: 'Candidate dashboard fetched successfully.', data: { dashboard } });
});

/**
 * Returns the authenticated HR user's dashboard.
 *
 * @route GET /api/v1/dashboard/hr
 * @access HR only
 */
export const getHrDashboard = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const dashboard = await dashboardService.getHrDashboard(authUser.id);
  sendSuccess(res, { message: 'HR dashboard fetched successfully.', data: { dashboard } });
});
