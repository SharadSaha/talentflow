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

  // Auth secrets — implementation comes later; kept optional for scaffolding.
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('1d'),

  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment configuration. See errors above.');
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
