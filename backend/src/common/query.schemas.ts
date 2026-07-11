import { z } from 'zod';

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from '@/constants/pagination';
import { DEFAULT_SORT_ORDER, SORT_ORDERS } from '@/constants/query';
import { UUID_PATTERN } from '@/constants/validation';

/** Validates a route/path identifier as a UUID (any version, including v7). */
export const uuidSchema = z.string().regex(UUID_PATTERN, 'A valid identifier is required.');

/** `{ params: { id } }` schema for endpoints keyed by a single `:id` param. */
export const idParamsSchema = z.object({
  params: z.object({ id: uuidSchema }),
});

/** Reusable `page` / `limit` query validation with coercion and safe bounds. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

/**
 * Builds a `sortBy` / `sortOrder` query schema constrained to a whitelist of
 * fields, so clients cannot sort by arbitrary columns.
 */
export function sortQuerySchema<const TFields extends readonly [string, ...string[]]>(
  fields: TFields,
  defaultField: TFields[number],
) {
  return z.object({
    sortBy: z.enum(fields).default(defaultField),
    sortOrder: z.enum(SORT_ORDERS).default(DEFAULT_SORT_ORDER),
  });
}

/**
 * Normalises a repeated (`?s=a&s=b`) or comma-separated (`?s=a,b`) query
 * parameter into a string array, or `undefined` when absent.
 */
export const csvStringArraySchema = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return undefined;
}, z.array(z.string()).optional());
