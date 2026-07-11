import type { NextFunction, Request, Response } from 'express';

import { ConflictError, ValidationError } from '@/errors';

import { errorHandler } from './error-handler';

interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  statusCode?: number;
  body?: unknown;
}

function buildResponse(): MockResponse {
  const res: MockResponse = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json.mockImplementation((body: unknown) => {
    res.body = body;
    return res;
  });
  return res;
}

const noopRequest = {} as Request;
const noopNext: NextFunction = jest.fn();

describe('errorHandler', () => {
  it('maps a known AppError to its status code and error body', () => {
    const res = buildResponse();

    errorHandler(
      new ConflictError('Email already exists.'),
      noopRequest,
      res as unknown as Response,
      noopNext,
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ success: false, message: 'Email already exists.', errors: [] });
  });

  it('includes field-level details from a ValidationError', () => {
    const res = buildResponse();
    const error = new ValidationError('Validation failed.', [
      { field: 'email', message: 'Invalid.' },
    ]);

    errorHandler(error, noopRequest, res as unknown as Response, noopNext);

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      success: false,
      message: 'Validation failed.',
      errors: [{ field: 'email', message: 'Invalid.' }],
    });
  });

  it('maps an unexpected error to a generic 500 without leaking details', () => {
    const res = buildResponse();

    errorHandler(
      new Error('Database connection string leaked here'),
      noopRequest,
      res as unknown as Response,
      noopNext,
    );

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ success: false, message: 'Internal server error.', errors: [] });
    expect(JSON.stringify(res.body)).not.toContain('leaked');
  });
});
