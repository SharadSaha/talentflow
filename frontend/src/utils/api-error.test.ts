import { describe, expect, it } from 'vitest';

import { getApiErrorMessage, normalizeApiError } from '@/utils/api-error';

describe('normalizeApiError', () => {
  it('maps a backend error envelope, extracting field errors', () => {
    const result = normalizeApiError({
      status: 400,
      data: {
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Email is required.' }],
      },
    });

    expect(result.status).toBe(400);
    expect(result.message).toBe('Validation failed');
    expect(result.fieldErrors).toEqual({ email: 'Email is required.' });
  });

  it('returns a friendly network message for fetch errors', () => {
    const result = normalizeApiError({ status: 'FETCH_ERROR', error: 'TypeError' });
    expect(result.status).toBe('FETCH_ERROR');
    expect(result.message).toMatch(/unable to reach the server/i);
  });

  it('falls back to a generic message for unknown errors', () => {
    const result = normalizeApiError(new Error('boom'));
    expect(result.status).toBe('UNKNOWN');
    expect(result.fieldErrors).toEqual({});
  });
});

describe('getApiErrorMessage', () => {
  it('returns just the message', () => {
    expect(getApiErrorMessage({ status: 'FETCH_ERROR', error: 'x' })).toMatch(/connection/i);
  });
});
