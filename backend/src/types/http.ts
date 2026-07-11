import type { Request } from 'express';

/**
 * An Express request with a strongly typed, validated body. Params and query
 * keep their Express defaults; only the body type is narrowed, so controllers
 * can read `req.body` without casting.
 */
export type RequestWithBody<TBody> = Request<Record<string, string>, unknown, TBody>;
