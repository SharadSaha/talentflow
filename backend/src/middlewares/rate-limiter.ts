import { rateLimit } from 'express-rate-limit';
import type { RequestHandler } from 'express';

import { env } from '@/config/env';
import type { ApiErrorResponse } from '@/types/api-response';

/**
 * Rate-limiting middleware. Centralised here so every limiter shares the same
 * headers policy and returns the standard {@link ApiErrorResponse} shape on a
 * 429 (rather than express-rate-limit's default plain-text body).
 */
function buildRateLimitBody(message: string): ApiErrorResponse {
  return { success: false, message, errors: [] };
}

/** Baseline limiter applied to every request as a coarse abuse guard. */
export const globalRateLimiter: RequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: buildRateLimitBody('Too many requests, please try again later.'),
});

/**
 * Stricter limiter for authentication endpoints (login/register). Successful
 * requests are not counted, so legitimate users are never locked out — only
 * repeated failed attempts (brute force / enumeration) consume the budget.
 */
export const authRateLimiter: RequestHandler = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: buildRateLimitBody('Too many authentication attempts, please try again later.'),
});
