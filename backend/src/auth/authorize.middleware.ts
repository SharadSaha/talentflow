import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { AuthenticationError, AuthorizationError } from '@/errors';
import type { UserRole } from '@/generated/prisma/enums';

/**
 * Role-based authorization middleware factory. Produces a middleware that allows
 * the request through only when the authenticated user's role is in
 * `allowedRoles`. Must be mounted after {@link authenticate}.
 *
 * Example: `authorize(UserRole.CANDIDATE)` blocks HR users with a 403.
 */
export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AuthorizationError());
      return;
    }

    next();
  };
}
