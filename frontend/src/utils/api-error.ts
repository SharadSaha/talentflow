import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { ApiErrorItem, ApiErrorResponse, NormalizedApiError } from '@/types/api';

/**
 * Normalises the various error shapes RTK Query can surface into a single,
 * UI-friendly structure. Keeps error handling consistent across every feature
 * without leaking transport details into components.
 */

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

/** Type guard for the RTK Query `FetchBaseQueryError` union. */
export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

/** Type guard for the backend's error response envelope. */
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    (data as { success: unknown }).success === false
  );
}

function toFieldErrors(errors: ApiErrorItem[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const error of errors) {
    if (error.field && !fieldErrors[error.field]) {
      fieldErrors[error.field] = error.message;
    }
  }
  return fieldErrors;
}

/** Converts any thrown/returned error into a `NormalizedApiError`. */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!isFetchBaseQueryError(error)) {
    return { status: 'UNKNOWN', message: DEFAULT_ERROR_MESSAGE, fieldErrors: {} };
  }

  if (error.status === 'FETCH_ERROR') {
    return { status: 'FETCH_ERROR', message: NETWORK_ERROR_MESSAGE, fieldErrors: {} };
  }

  if (error.status === 'PARSING_ERROR') {
    return { status: 'PARSING_ERROR', message: DEFAULT_ERROR_MESSAGE, fieldErrors: {} };
  }

  if (typeof error.status === 'number' && isApiErrorResponse(error.data)) {
    return {
      status: error.status,
      message: error.data.message || DEFAULT_ERROR_MESSAGE,
      fieldErrors: toFieldErrors(error.data.errors),
    };
  }

  return {
    status: typeof error.status === 'number' ? error.status : 'UNKNOWN',
    message: DEFAULT_ERROR_MESSAGE,
    fieldErrors: {},
  };
}

/** Extracts just the user-facing message from any error. */
export function getApiErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
