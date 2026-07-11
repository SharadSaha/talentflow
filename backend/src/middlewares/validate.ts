import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

import { ValidationError } from '@/errors';

interface ParsedRequest {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

/**
 * Request validation middleware factory. Validates the request against a Zod
 * schema shaped as `{ body?, query?, params? }` and, on success, replaces
 * `req.body` with the parsed (and coerced) value.
 *
 * `req.query` and `req.params` are read-only getters in Express 5, so they are
 * validated but not reassigned. On failure a `ValidationError` is forwarded to
 * the central error handler, producing a consistent 422 response.
 */
export function validate(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(ValidationError.fromZodError(result.error));
      return;
    }

    const parsed = result.data as ParsedRequest;

    // Surface parsed (coerced/defaulted) values. `req.query`/`req.params` are
    // read-only getters in Express 5, so they are exposed via `req.validated`.
    req.validated = { body: parsed.body, query: parsed.query, params: parsed.params };

    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    next();
  };
}
