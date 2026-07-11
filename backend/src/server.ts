import { createApp } from '@/app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('TalentFlow backend started', { port: env.PORT, environment: env.NODE_ENV });
});

// Graceful shutdown.
const shutdown = (signal: string) => {
  logger.info('Shutting down gracefully', { signal });
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { server };
