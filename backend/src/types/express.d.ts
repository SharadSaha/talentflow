import type { AuthUser } from '@/types/auth';

/**
 * Augments the Express `Request` with the authenticated principal so that
 * `req.user` is strongly typed throughout the application. It is populated by
 * the `authenticate` middleware and is `undefined` on unauthenticated requests.
 *
 * `express-serve-static-core` is where Express declares the `Request`
 * interface, so augmenting it here avoids using a `namespace`.
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
