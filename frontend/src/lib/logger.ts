/**
 * Centralised client logger. A thin, swappable abstraction over the console so
 * feature code never calls `console.*` directly and log destinations (e.g. a
 * monitoring service) can be wired in later without touching call sites.
 * Debug/info logs are suppressed in production builds.
 */
const isProduction = import.meta.env.PROD;

export const logger = {
  info(message: string, ...context: unknown[]): void {
    if (isProduction) return;
    console.info(`[info] ${message}`, ...context);
  },

  warn(message: string, ...context: unknown[]): void {
    console.warn(`[warn] ${message}`, ...context);
  },

  error(message: string, ...context: unknown[]): void {
    console.error(`[error] ${message}`, ...context);
  },
};
