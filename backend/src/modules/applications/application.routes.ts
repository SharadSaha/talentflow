import { Router } from 'express';

import { authenticate } from '@/auth/authenticate.middleware';
import { authorize } from '@/auth/authorize.middleware';
import { idParamsSchema } from '@/common/query.schemas';
import { APPLICATION_ROUTES, JOB_ROUTES } from '@/constants/routes';
import { UserRole } from '@/generated/prisma/enums';
import { validate } from '@/middlewares/validate';

import {
  apply,
  getJobApplicants,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
} from './application.controller';
import {
  applySchema,
  jobApplicantsQuerySchema,
  myApplicationsQuerySchema,
  updateStatusSchema,
} from './application.schemas';

/**
 * Application routes mounted under `/api/v1/applications`.
 *
 *   POST  /              — apply to a job (Candidate)
 *   GET   /me            — the candidate's own applications (Candidate)
 *   PATCH /:id/status    — update an applicant's status (HR owner)
 *   PATCH /:id/withdraw  — withdraw an application (Candidate owner)
 */
const applicationRouter = Router();

applicationRouter.post(
  APPLICATION_ROUTES.ROOT,
  authenticate,
  authorize(UserRole.CANDIDATE),
  validate(applySchema),
  apply,
);
applicationRouter.get(
  APPLICATION_ROUTES.MINE,
  authenticate,
  authorize(UserRole.CANDIDATE),
  validate(myApplicationsQuerySchema),
  getMyApplications,
);
applicationRouter.patch(
  APPLICATION_ROUTES.STATUS,
  authenticate,
  authorize(UserRole.HR),
  validate(updateStatusSchema),
  updateApplicationStatus,
);
applicationRouter.patch(
  APPLICATION_ROUTES.WITHDRAW,
  authenticate,
  authorize(UserRole.CANDIDATE),
  validate(idParamsSchema),
  withdrawApplication,
);

/**
 * The applicant sub-resource of a job, mounted under `/api/v1/jobs`.
 *
 *   GET /:id/applications — list applicants for a job (HR owner)
 */
const jobApplicantsRouter = Router();

jobApplicantsRouter.get(
  JOB_ROUTES.APPLICANTS,
  authenticate,
  authorize(UserRole.HR),
  validate(jobApplicantsQuerySchema),
  getJobApplicants,
);

export { applicationRouter, jobApplicantsRouter };
