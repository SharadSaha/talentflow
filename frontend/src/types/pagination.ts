/** Ascending or descending sort direction. */
export type SortOrder = 'asc' | 'desc';

/** Pagination + sort inputs sent to list endpoints. */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
}

/** Pagination metadata returned alongside every paginated list. Mirrors backend. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** A page of results plus its metadata — the normalised shape RTK Query returns. */
export interface Paginated<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}
