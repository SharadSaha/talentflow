import { env, isTest } from '@/config/env';

/**
 * Minimal centralised structured logger. All application logging goes through
 * this module rather than `console.*` directly, so log format and destination
 * can be changed in one place.
 *
 * Logs are emitted as single-line JSON (easy to ingest by log aggregators) and
 * suppressed during tests to keep test output clean.
 */
type LogLevel = 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (isTest) {
    return;
  }

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    ...(meta ? { meta } : {}),
  };

  const serialized = JSON.stringify(entry);

  if (level === 'error') {
    process.stderr.write(`${serialized}\n`);
    return;
  }

  process.stdout.write(`${serialized}\n`);
}

export const logger = {
  info: (message: string, meta?: LogMeta): void => write('info', message, meta),
  warn: (message: string, meta?: LogMeta): void => write('warn', message, meta),
  error: (message: string, meta?: LogMeta): void => write('error', message, meta),
};
