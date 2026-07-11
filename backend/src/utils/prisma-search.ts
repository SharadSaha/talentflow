/**
 * Reusable Prisma query fragments for case-insensitive text search, so search
 * logic is not duplicated across repositories.
 */

/**
 * Builds a case-insensitive "contains" filter (PostgreSQL `ILIKE '%value%'`).
 * The returned literal is structurally compatible with both nullable and
 * non-nullable Prisma string filters.
 */
export function insensitiveContains(value: string): { contains: string; mode: 'insensitive' } {
  return { contains: value, mode: 'insensitive' };
}
