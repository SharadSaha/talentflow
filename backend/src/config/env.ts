import 'dotenv/config';
import { z } from 'zod';

/**
 * Centralised, validated environment configuration.
 * The application should read config from here rather than `process.env`
 * directly, so that missing/invalid values fail fast at startup.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  // Comma-separated list of allowed CORS origins.
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Connection strings — populated later when features are implemented.
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Auth secrets. A secret is mandatory so the app fails fast if it is missing.
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long.'),
  JWT_EXPIRES_IN: z.string().default('1d'),

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

export const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
