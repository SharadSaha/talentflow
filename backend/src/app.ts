import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOrigins, env, isTest } from '@/config/env';
import { API_V1_PREFIX } from '@/constants/routes';
import { errorHandler } from '@/middlewares/error-handler';
import { notFound } from '@/middlewares/not-found';
import { globalRateLimiter } from '@/middlewares/rate-limiter';
import { healthRouter } from '@/modules/health/health.routes';
import { v1Router } from '@/routes';

/**
 * Builds and configures the Express application: cross-cutting infrastructure
 * middleware, versioned feature routes, and centralised 404 + error handling.
 */
export function createApp(): Application {
  const app = express();

  // Trust the reverse proxy (nginx / load balancer) in front of the API.
  app.set('trust proxy', 1);

  // Security headers.
  app.use(helmet());

  // Cross-origin resource sharing.
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  // Gzip/deflate compression.
  app.use(compression());

  // Body & cookie parsing.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logging (quiet during tests).
  if (!isTest) {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Operational endpoints (/health, /version) — mounted before rate limiting so
  // container/load-balancer probes are never throttled.
  app.use(healthRouter);

  // Basic rate limiting (coarse, applied to every request).
  app.use(globalRateLimiter);

  // Versioned API routes.
  app.use(API_V1_PREFIX, v1Router);

  // Unmatched routes and centralised error handling (registered last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
