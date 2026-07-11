/**
 * Jest setup — runs before any test module is imported, so environment
 * variables required by `@/config/env` are present when it is first evaluated.
 * Keeps the test suite deterministic and independent of a real `.env` file.
 */
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] ??= 'test-jwt-secret-value-at-least-16-characters-long';
process.env['JWT_EXPIRES_IN'] ??= '1h';
