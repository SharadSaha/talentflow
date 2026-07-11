import type { Request } from 'express';

/**
 * Typed accessors for the values produced by the `validate` middleware and
 * stored on `req.validated`. They narrow the parsed `unknown` to the schema's
 * inferred type, so controllers read validated query/params without `any`.
 *
 * A controller must only call these on a route guarded by `validate`; otherwise
 * the corresponding value is absent.
 */
export function getValidatedQuery<TQuery>(req: Request): TQuery {
  return (req.validated?.query ?? {}) as TQuery;
}

export function getValidatedParams<TParams>(req: Request): TParams {
  return (req.validated?.params ?? {}) as TParams;
}
