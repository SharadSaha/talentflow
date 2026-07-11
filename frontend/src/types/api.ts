import type { PaginationMeta } from '@/types/pagination';

/**
 * Shared API response contracts. These mirror the backend response envelope so
 * that RTK Query endpoints and error handling stay type-safe end to end.
 */

/** A single validation/error detail. `field` is omitted for non-field errors. */
export interface ApiErrorItem {
  field?: string;
  message: string;
}

export interface ApiSuccessResponse<TData> {
  success: true;
  message: string;
  data: TData;
}

/** Success envelope for paginated list endpoints. */
export interface ApiPaginatedResponse<TItem> {
  success: true;
  message: string;
  data: TItem[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorItem[];
}

/**
 * A normalised error surfaced to the UI after parsing an RTK Query error.
 * `fieldErrors` maps form field names to messages for inline form display.
 */
export interface NormalizedApiError {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'UNKNOWN';
  message: string;
  fieldErrors: Record<string, string>;
}
