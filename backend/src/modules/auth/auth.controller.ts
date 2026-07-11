import { requireAuthUser } from '@/auth/require-auth-user';
import { sendSuccess } from '@/common/api-response';
import { HTTP_STATUS } from '@/constants/http-status';
import type { RequestWithBody } from '@/types/http';
import { asyncHandler } from '@/utils/async-handler';

import { authService } from './auth.service';
import type { LoginInput, RegisterInput } from './auth.schemas';

/**
 * Registers a new candidate account.
 *
 * @route POST /api/v1/auth/register
 * @access Public
 * @returns 201 with `{ user, accessToken }`.
 */
export const register = asyncHandler<RequestWithBody<RegisterInput>>(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Account created successfully.',
    data: result,
  });
});

/**
 * Authenticates a user and issues an access token.
 *
 * @route POST /api/v1/auth/login
 * @access Public
 * @returns 200 with `{ user, accessToken }`.
 */
export const login = asyncHandler<RequestWithBody<LoginInput>>(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, {
    message: 'Logged in successfully.',
    data: result,
  });
});

/**
 * Returns the currently authenticated user.
 *
 * @route GET /api/v1/auth/me
 * @access Authenticated (HR or Candidate)
 * @returns 200 with `{ user }`.
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const authUser = requireAuthUser(req);
  const user = await authService.getAuthenticatedUser(authUser.id);
  sendSuccess(res, {
    message: 'Current user fetched successfully.',
    data: { user },
  });
});
