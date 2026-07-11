/** Ascending or descending sort direction. */
export type SortOrder = 'asc' | 'desc';

/** Normalised pagination inputs (1-based page). */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Pagination metadata returned alongside every paginated list. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** A page of results plus its metadata, returned by repositories/services. */
export interface Paginated<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}
