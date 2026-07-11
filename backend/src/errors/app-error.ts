import type { ApiErrorItem } from '@/types/api-response';

/**
 * Base class for all expected (operational) application errors. Each subclass
 * declares the HTTP status code it maps to, so the central error handler can
 * translate any thrown `AppError` into a consistent HTTP response without
 * knowing the specific type.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  /** Optional field-level details, primarily used for validation errors. */
  readonly errors: ApiErrorItem[];

  constructor(message: string, errors: ApiErrorItem[] = []) {
    super(message);
    this.name = new.target.name;
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}
