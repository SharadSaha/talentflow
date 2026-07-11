import { Router } from 'express';

import { authenticate } from '@/auth/authenticate.middleware';
import { authorize } from '@/auth/authorize.middleware';
import { PROFILE_ROUTES } from '@/constants/routes';
import { UserRole } from '@/generated/prisma/enums';
import { validate } from '@/middlewares/validate';

import { getProfile, updateProfile } from './profile.controller';
import { updateProfileSchema } from './profile.schemas';

/**
 * Candidate profile routes, mounted under `/api/v1/profile`. Every route
 * requires an authenticated Candidate; HR users are rejected with a 403.
 *
 *   GET   / — fetch the authenticated candidate's own profile
 *   PATCH / — update the authenticated candidate's own profile
 */
const router = Router();

router.get(PROFILE_ROUTES.ROOT, authenticate, authorize(UserRole.CANDIDATE), getProfile);

router.patch(
  PROFILE_ROUTES.ROOT,
  authenticate,
  authorize(UserRole.CANDIDATE),
  validate(updateProfileSchema),
  updateProfile,
);

export { router as profileRouter };
