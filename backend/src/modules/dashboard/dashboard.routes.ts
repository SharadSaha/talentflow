import { Router } from 'express';

import { authenticate } from '@/auth/authenticate.middleware';
import { authorize } from '@/auth/authorize.middleware';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { UserRole } from '@/generated/prisma/enums';

import { getCandidateDashboard, getHrDashboard } from './dashboard.controller';

/**
 * Dashboard routes mounted under `/api/v1/dashboard`.
 *
 *   GET /candidate — the authenticated candidate's dashboard (Candidate)
 *   GET /hr        — the authenticated HR user's dashboard (HR)
 */
const dashboardRouter = Router();

dashboardRouter.get(
  DASHBOARD_ROUTES.CANDIDATE,
  authenticate,
  authorize(UserRole.CANDIDATE),
  getCandidateDashboard,
);

dashboardRouter.get(DASHBOARD_ROUTES.HR, authenticate, authorize(UserRole.HR), getHrDashboard);

export { dashboardRouter };
