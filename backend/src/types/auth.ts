import type { UserRole } from '@/generated/prisma/enums';

/**
 * The authenticated principal attached to `req.user` after the `authenticate`
 * middleware runs. Kept minimal and derived from the JWT — never the full DB
 * record.
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * The claims encoded in an access token. `sub` is the user id, following the
 * JWT `sub` (subject) convention.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
