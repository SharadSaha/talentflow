import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

import { env, corsOrigins, isTest } from '@/config/env';

/**
 * Builds and configures the Express application.
 *
 * Only cross-cutting infrastructure middleware is wired here. Feature routes,
 * authentication, and business logic are intentionally NOT implemented yet.
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

  // Basic rate limiting.
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  // Health check — used by Docker/Compose and load balancers.
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'talentflow-backend',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
    });
  });

  // API root placeholder. Feature routers will be mounted under /api later.
  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'TalentFlow API — coming soon.' });
  });

  // 404 handler.
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Centralised error handler. Express identifies error handlers by their
  // 4-argument signature, so `next` must be present even though it is unused.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}
