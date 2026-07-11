import { Router } from 'express';

import { HEALTH_ROUTES } from '@/constants/routes';

import { getHealth, getVersion } from './health.controller';

/**
 * Operational routes, mounted at the application root (outside the `/api/v1`
 * prefix) so container/load-balancer health checks and deployment tooling can
 * reach them at stable, unversioned paths.
 *
 *   GET /health  — dependency health probe (200 healthy / 503 degraded)
 *   GET /version — build and version metadata
 */
const healthRouter = Router();

healthRouter.get(HEALTH_ROUTES.HEALTH, getHealth);
healthRouter.get(HEALTH_ROUTES.VERSION, getVersion);

export { healthRouter };
