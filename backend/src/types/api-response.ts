/**
 * Shared API response contracts. Every endpoint returns one of these shapes so
 * clients can rely on a predictable structure.
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

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorItem[];
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;
