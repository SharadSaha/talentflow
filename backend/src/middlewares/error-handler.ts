import type { NextFunction, Request, Response } from 'express';

import { logger } from '@/config/logger';
import { HTTP_STATUS } from '@/constants/http-status';
import { AppError } from '@/errors';
import type { ApiErrorResponse } from '@/types/api-response';

/**
 * Centralised error handler. Translates known {@link AppError}s into their
 * declared HTTP status with a consistent error body, and maps any unexpected
 * error to a generic 500 — without leaking messages or stack traces to clients.
 *
 * Express identifies error handlers by their four-argument signature, so
 * `next` must be present even though it is unused here.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      message: error.message,
      errors: error.errors,
    };
    res.status(error.statusCode).json(body);
    return;
  }

  logger.error('Unhandled error', {
    error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
  });

  const body: ApiErrorResponse = {
    success: false,
    message: 'Internal server error.',
    errors: [],
  };
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(body);
}
