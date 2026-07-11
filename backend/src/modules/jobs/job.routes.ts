import { Router } from 'express';

import { authenticate } from '@/auth/authenticate.middleware';
import { authorize } from '@/auth/authorize.middleware';
import { idParamsSchema } from '@/common/query.schemas';
import { HR_ROUTES, JOB_ROUTES } from '@/constants/routes';
import { UserRole } from '@/generated/prisma/enums';
import { validate } from '@/middlewares/validate';

import {
  browseJobs,
  createJob,
  deleteJob,
  getHrJobs,
  getJobById,
  updateJob,
} from './job.controller';
import { createJobSchema, jobListQuerySchema, updateJobSchema } from './job.schemas';

/**
 * Job routes mounted under `/api/v1/jobs`.
 *
 *   POST   /        — create a job (HR)
 *   GET    /        — browse live jobs (authenticated)
 *   GET    /:id     — job details (authenticated; non-live jobs visible to owner only)
 *   PATCH  /:id     — edit/close a job (HR owner)
 *   DELETE /:id     — soft-delete a job (HR owner)
 */
const jobRouter = Router();

jobRouter.post(
  JOB_ROUTES.ROOT,
  authenticate,
  authorize(UserRole.HR),
  validate(createJobSchema),
  createJob,
);
jobRouter.get(JOB_ROUTES.ROOT, authenticate, validate(jobListQuerySchema), browseJobs);
jobRouter.get(JOB_ROUTES.BY_ID, authenticate, validate(idParamsSchema), getJobById);
jobRouter.patch(
  JOB_ROUTES.BY_ID,
  authenticate,
  authorize(UserRole.HR),
  validate(updateJobSchema),
  updateJob,
);
jobRouter.delete(
  JOB_ROUTES.BY_ID,
  authenticate,
  authorize(UserRole.HR),
  validate(idParamsSchema),
  deleteJob,
);

/**
 * HR job routes mounted under `/api/v1/hr`.
 *
 *   GET /jobs — list the authenticated HR user's own jobs (any status)
 */
const hrJobRouter = Router();

hrJobRouter.get(
  HR_ROUTES.JOBS,
  authenticate,
  authorize(UserRole.HR),
  validate(jobListQuerySchema),
  getHrJobs,
);

export { hrJobRouter, jobRouter };
