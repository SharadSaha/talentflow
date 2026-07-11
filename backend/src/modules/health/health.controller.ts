import { HTTP_STATUS } from '@/constants/http-status';
import { asyncHandler } from '@/utils/async-handler';

import { healthService } from './health.service';

/**
 * Liveness/readiness probe. Returns 200 when the database is reachable and 503
 * when it is not, with a structured body describing each dependency.
 *
 * @route GET /health
 * @access Public
 */
export const getHealth = asyncHandler(async (_req, res) => {
  const { dto, healthy } = await healthService.getHealth();
  res.status(healthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json(dto);
});

/**
 * Build/version metadata.
 *
 * @route GET /version
 * @access Public
 */
export const getVersion = asyncHandler(async (_req, res) => {
  res.status(HTTP_STATUS.OK).json(healthService.getVersion());
});
