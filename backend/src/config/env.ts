import 'dotenv/config';
import { z } from 'zod';

/**
 * Centralised, validated environment configuration.
 *
 * The application must read config from here rather than `process.env` directly,
 * so that missing/invalid values fail fast at startup. Every supported variable
 * is documented by its Zod entry below.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),

    // Database connection string (required — the API cannot run without it).
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),

    // Redis connection string (optional — Redis-backed features degrade to disabled).
    REDIS_URL: z.string().min(1).optional(),

    // Allowed CORS origin(s). `FRONTEND_URL` is the canonical name; `CORS_ORIGIN`
    // is kept as a backward-compatible alias. Comma-separated values are allowed.
    FRONTEND_URL: z.string().min(1).optional(),
    CORS_ORIGIN: z.string().min(1).optional(),

    // Auth secrets. A secret is mandatory so the app fails fast if it is missing.
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long.'),
    JWT_EXPIRES_IN: z.string().default('1d'),

    // Deployment commit SHA, resolved from whichever platform variable is present.
    COMMIT_SHA: z.string().min(1).optional(),
    GIT_COMMIT: z.string().min(1).optional(),
    RENDER_GIT_COMMIT: z.string().min(1).optional(),

    RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

    // Stricter limit applied to authentication endpoints (login/register) to
    // slow down credential brute-force and account-enumeration attacks.
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60 * 1000),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  })
  .superRefine((data, ctx) => {
    // In production a real frontend origin must be configured — never a wildcard.
    if (data.NODE_ENV === 'production' && !data.FRONTEND_URL && !data.CORS_ORIGIN) {
      ctx.addIssue({
        code: 'custom',
        path: ['FRONTEND_URL'],
        message: 'FRONTEND_URL (or CORS_ORIGIN) is required in production.',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Written directly to stderr rather than via the logger: the logger itself
  // depends on this module, so it cannot report a failure to load it.
  const details = JSON.stringify(z.treeifyError(parsed.error), null, 2);
  process.stderr.write(`Invalid environment variables:\n${details}\n`);
  throw new Error('Invalid environment configuration. See errors above.');
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Resolves the allowed CORS origins. Production uses only the explicitly
 * configured `FRONTEND_URL` (falling back to the `CORS_ORIGIN` alias) — never a
 * wildcard. Development/test default to the local Vite frontend.
 */
function resolveCorsOrigins(): string[] {
  const configured = env.FRONTEND_URL ?? env.CORS_ORIGIN;
  const raw = configured ?? (isProduction ? '' : 'http://localhost:5173');
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export const corsOrigins = resolveCorsOrigins();

/** The deployment commit SHA, resolved from the first available platform variable. */
export const commitSha = env.COMMIT_SHA ?? env.GIT_COMMIT ?? env.RENDER_GIT_COMMIT ?? 'unknown';
