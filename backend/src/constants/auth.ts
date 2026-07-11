/**
 * Authentication-related constants shared across the auth primitives and
 * middleware. Centralised here to avoid magic strings/numbers.
 */

/** Prefix of the `Authorization: Bearer <token>` header. */
export const BEARER_PREFIX = 'Bearer ';

/**
 * bcrypt cost factor. 12 is a sensible production default that balances
 * hashing cost against security.
 */
export const BCRYPT_SALT_ROUNDS = 12;
