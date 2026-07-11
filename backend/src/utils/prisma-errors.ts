/** Prisma error code for a unique constraint violation. */
const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

/**
 * Type guard for a Prisma unique-constraint violation, without importing the
 * concrete error class. Used to translate race-condition duplicate writes into
 * a domain `ConflictError`.
 */
export function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === UNIQUE_CONSTRAINT_ERROR_CODE
  );
}
