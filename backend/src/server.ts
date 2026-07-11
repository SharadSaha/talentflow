import { createApp } from '@/app';
import { env } from '@/config/env';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 TalentFlow backend listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown.
const shutdown = (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { server };
