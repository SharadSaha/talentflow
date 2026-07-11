/**
 * Jest setup — runs before any test module is imported, so environment
 * variables required by `@/config/env` are present when it is first evaluated.
 * Keeps the test suite deterministic and independent of a real `.env` file.
 */
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] ??= 'test-jwt-secret-value-at-least-16-characters-long';
process.env['JWT_EXPIRES_IN'] ??= '1h';

// A syntactically valid connection string so the Prisma client can be
// constructed when the app is loaded. Integration tests mock the repository
// layer, so the driver never actually opens a connection (pg connects lazily).
process.env['DATABASE_URL'] ??=
  'postgresql://test:test@localhost:5432/talentflow_test?schema=public';
