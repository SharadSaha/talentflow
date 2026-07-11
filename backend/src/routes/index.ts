import { Router } from 'express';

import { AUTH_ROUTES, PROFILE_ROUTES } from '@/constants/routes';
import { authRouter } from '@/modules/auth/auth.routes';
import { profileRouter } from '@/modules/candidate-profile/profile.routes';

/**
 * Aggregates all versioned (`/api/v1`) feature routers. New feature modules are
 * mounted here, keeping route registration centralised.
 */
const v1Router = Router();

v1Router.use(AUTH_ROUTES.BASE, authRouter);
v1Router.use(PROFILE_ROUTES.BASE, profileRouter);

export { v1Router };
