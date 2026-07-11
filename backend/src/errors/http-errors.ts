import type { ZodError } from 'zod';

import { HTTP_STATUS } from '@/constants/http-status';
import type { ApiErrorItem } from '@/types/api-response';

import { AppError } from './app-error';

/** 400 — the request was malformed or semantically invalid. */
export class BadRequestError extends AppError {
  readonly statusCode = HTTP_STATUS.BAD_REQUEST;
}

/** 401 — authentication is required or the provided credentials are invalid. */
export class AuthenticationError extends AppError {
  readonly statusCode = HTTP_STATUS.UNAUTHORIZED;

  constructor(message = 'Authentication is required.', errors: ApiErrorItem[] = []) {
    super(message, errors);
  }
}

/** 403 — the authenticated user is not permitted to perform this action. */
export class AuthorizationError extends AppError {
  readonly statusCode = HTTP_STATUS.FORBIDDEN;

  constructor(
    message = 'You do not have permission to access this resource.',
    errors: ApiErrorItem[] = [],
  ) {
    super(message, errors);
  }
}

/** 404 — the requested resource does not exist. */
export class NotFoundError extends AppError {
  readonly statusCode = HTTP_STATUS.NOT_FOUND;

  constructor(message = 'Resource not found.', errors: ApiErrorItem[] = []) {
    super(message, errors);
  }
}

/** 409 — the request conflicts with the current state (e.g. duplicate email). */
export class ConflictError extends AppError {
  readonly statusCode = HTTP_STATUS.CONFLICT;
}

/** 422 — the request failed schema validation. */
export class ValidationError extends AppError {
  readonly statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;

  constructor(message = 'Validation failed.', errors: ApiErrorItem[] = []) {
    super(message, errors);
  }

  /**
   * Builds a `ValidationError` from a Zod parsing error, flattening each issue
   * into a `{ field, message }` pair. The leading `body` / `query` / `params`
   * path segment (added by the request wrapper schema) is stripped so the
   * reported field matches the client's request shape.
   */
  static fromZodError(error: ZodError): ValidationError {
    const requestSegments = new Set(['body', 'query', 'params']);

    const errors: ApiErrorItem[] = error.issues.map((issue) => {
      const path =
        issue.path.length > 0 && requestSegments.has(String(issue.path[0]))
          ? issue.path.slice(1)
          : issue.path;
      const field = path.map((segment) => String(segment)).join('.');

      return field.length > 0 ? { field, message: issue.message } : { message: issue.message };
    });

    return new ValidationError('Validation failed.', errors);
  }
}
