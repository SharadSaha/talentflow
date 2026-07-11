import bcrypt from 'bcrypt';

import { BCRYPT_SALT_ROUNDS } from '@/constants/auth';

/**
 * Hashes a plaintext password using bcrypt. The resulting hash embeds the salt,
 * so it can be stored directly and compared later with {@link comparePassword}.
 */
export function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash. Returns `true`
 * when they match.
 */
export function comparePassword(plainTextPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, passwordHash);
}
