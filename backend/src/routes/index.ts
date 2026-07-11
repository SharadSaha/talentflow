import { Router } from 'express';

import {
  APPLICATION_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  HR_ROUTES,
  JOB_ROUTES,
  PROFILE_ROUTES,
} from '@/constants/routes';
import { applicationRouter, jobApplicantsRouter } from '@/modules/applications/application.routes';
import { authRouter } from '@/modules/auth/auth.routes';
import { profileRouter } from '@/modules/candidate-profile/profile.routes';
import { dashboardRouter } from '@/modules/dashboard/dashboard.routes';
import { hrJobRouter, jobRouter } from '@/modules/jobs/job.routes';

/**
 * Aggregates all versioned (`/api/v1`) feature routers. New feature modules are
 * mounted here, keeping route registration centralised.
 *
 * `jobRouter` and `jobApplicantsRouter` share the `/jobs` mount: the former owns
 * the job CRUD routes, the latter the `/jobs/:id/applications` sub-resource.
 */
const v1Router = Router();

v1Router.use(AUTH_ROUTES.BASE, authRouter);
v1Router.use(PROFILE_ROUTES.BASE, profileRouter);
v1Router.use(JOB_ROUTES.BASE, jobRouter);
v1Router.use(JOB_ROUTES.BASE, jobApplicantsRouter);
v1Router.use(HR_ROUTES.BASE, hrJobRouter);
v1Router.use(APPLICATION_ROUTES.BASE, applicationRouter);
v1Router.use(DASHBOARD_ROUTES.BASE, dashboardRouter);

export { v1Router };
