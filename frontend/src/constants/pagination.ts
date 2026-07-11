/**
 * Pagination defaults and bounds. Mirrors the backend contract so client
 * requests never fall outside accepted ranges.
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 100;

/** Selectable page-size options for list views. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
