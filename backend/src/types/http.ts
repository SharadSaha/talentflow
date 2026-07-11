import type { Request } from 'express';

/**
 * An Express request with a strongly typed, validated body. Params and query
 * keep their Express defaults; only the body type is narrowed, so controllers
 * can read `req.body` without casting.
 */
export type RequestWithBody<TBody> = Request<Record<string, string>, unknown, TBody>;

/**
 * The parsed output of the `validate` middleware, stored on `req.validated`.
 * Express 5 exposes `req.query`/`req.params` as read-only getters, so coerced
 * and defaulted values are surfaced here instead of mutating the request.
 */
export interface ValidatedData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}
