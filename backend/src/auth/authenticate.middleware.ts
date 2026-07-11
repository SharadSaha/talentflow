import type { NextFunction, Request, Response } from 'express';

import { BEARER_PREFIX } from '@/constants/auth';
import { AuthenticationError } from '@/errors';

import { verifyAccessToken } from './token.service';

/**
 * Authentication middleware. Extracts the bearer token from the `Authorization`
 * header, verifies it, and attaches the decoded principal to `req.user`. Any
 * failure is forwarded to the central error handler as an `AuthenticationError`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith(BEARER_PREFIX)) {
      throw new AuthenticationError('Authentication token is missing.');
    }

    const token = header.slice(BEARER_PREFIX.length).trim();

    if (token.length === 0) {
      throw new AuthenticationError('Authentication token is missing.');
    }

    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
