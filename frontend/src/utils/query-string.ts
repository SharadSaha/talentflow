/**
 * Query-string helpers for building request URLs and reading search params.
 * Values that are `undefined`, `null`, or empty strings are omitted so URLs
 * stay clean.
 */

type QueryValue = string | number | boolean | undefined | null;

export type QueryParams = Record<string, QueryValue>;

/** Serialises a params object into a query string (without the leading `?`). */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    searchParams.set(key, String(value));
  }

  return searchParams.toString();
}

/** Parses a query string (or `URLSearchParams`) into a plain string record. */
export function parseQueryString(source: string | URLSearchParams): Record<string, string> {
  const searchParams = typeof source === 'string' ? new URLSearchParams(source) : source;
  return Object.fromEntries(searchParams.entries());
}
