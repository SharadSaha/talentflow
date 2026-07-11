import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler<TRequest extends Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an async Express handler so that any rejected promise is forwarded to
 * the centralised error handler via `next`, instead of producing an unhandled
 * rejection. The generic `TRequest` lets controllers receive a strongly typed
 * request (e.g. with a typed body) without per-line casts.
 */
export function asyncHandler<TRequest extends Request = Request>(
  handler: AsyncRequestHandler<TRequest>,
): RequestHandler {
  return (req, res, next) => {
    handler(req as TRequest, res, next).catch(next);
  };
}
