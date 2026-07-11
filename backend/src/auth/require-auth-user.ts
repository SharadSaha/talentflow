import type { Request } from 'express';

import { AuthenticationError } from '@/errors';
import type { AuthUser } from '@/types/auth';

/**
 * Returns the authenticated user from the request, narrowing away the optional
 * `undefined`. Intended for handlers mounted behind the `authenticate`
 * middleware; the throw is a defensive guard that should never trigger in
 * practice.
 */
export function requireAuthUser(req: Request): AuthUser {
  if (!req.user) {
    throw new AuthenticationError();
  }
  return req.user;
}
