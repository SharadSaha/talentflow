import type { NextFunction, Request, Response } from 'express';

import { NotFoundError } from '@/errors';

/**
 * Terminal 404 handler for unmatched routes. Forwards a {@link NotFoundError}
 * to the central error handler so unknown routes return the same consistent
 * error shape as every other endpoint.
 */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}
