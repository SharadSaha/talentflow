import jwt from 'jsonwebtoken';
import type { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';

import { env } from '@/config/env';
import { AuthenticationError } from '@/errors';
import { UserRole } from '@/generated/prisma/enums';
import type { AuthUser, JwtPayload } from '@/types/auth';

/**
 * The single signing/verification algorithm the API supports. Pinning it
 * explicitly (rather than relying on library defaults) prevents algorithm
 * confusion and "alg: none" downgrade attacks: a token signed with any other
 * algorithm is rejected during verification.
 */
const JWT_ALGORITHM: Algorithm = 'HS256';

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (Object.values(UserRole) as string[]).includes(value);
}

function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return env.JWT_SECRET;
}

/**
 * Signs a short-lived access token for the given user. The token carries the
 * user id (`sub`), email, and role — enough for authorization without a DB
 * lookup on every request.
 */
export function signAccessToken(user: AuthUser): string {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  const options: SignOptions = {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

/**
 * Verifies and decodes an access token, returning the authenticated principal.
 * Throws an {@link AuthenticationError} for any invalid, expired, or malformed
 * token so the caller never has to interpret raw JWT errors.
 */
export function verifyAccessToken(token: string): AuthUser {
  let decoded: string | jwt.JwtPayload;

  const options: VerifyOptions = { algorithms: [JWT_ALGORITHM] };

  try {
    decoded = jwt.verify(token, getJwtSecret(), options);
  } catch {
    throw new AuthenticationError('Invalid or expired authentication token.');
  }

  if (typeof decoded === 'string') {
    throw new AuthenticationError('Invalid authentication token.');
  }

  const { sub, email, role } = decoded;

  if (typeof sub !== 'string' || typeof email !== 'string' || !isUserRole(role)) {
    throw new AuthenticationError('Invalid authentication token.');
  }

  return { id: sub, email, role };
}
