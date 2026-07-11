import { requireAuthUser } from '@/auth/require-auth-user';
import { sendSuccess } from '@/common/api-response';
import type { RequestWithBody } from '@/types/http';
import { asyncHandler } from '@/utils/async-handler';

import { candidateProfileService } from './profile.service';
import type { UpdateProfileInput } from './profile.schemas';

/**
 * Returns the authenticated candidate's own profile.
 *
 * @route GET /api/v1/profile
 * @access Candidate only
 * @returns 200 with the candidate profile.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const profile = await candidateProfileService.getOwnProfile(authUser.id);
  sendSuccess(res, {
    message: 'Profile fetched successfully.',
    data: { profile },
  });
});

/**
 * Updates the authenticated candidate's own profile.
 *
 * @route PATCH /api/v1/profile
 * @access Candidate only
 * @returns 200 with the updated candidate profile.
 */
export const updateProfile = asyncHandler<RequestWithBody<UpdateProfileInput>>(async (req, res) => {
  const authUser = requireAuthUser(req);
  const profile = await candidateProfileService.updateOwnProfile(authUser.id, req.body);
  sendSuccess(res, {
    message: 'Profile updated successfully.',
    data: { profile },
  });
});
