import { APP_VERSION } from '@/config/app-info';
import { commitSha, env } from '@/config/env';
import { checkRedisConnection } from '@/config/redis';

import type { HealthDto, VersionDto } from './health.dto';
import { healthRepository } from './health.repository';
import type { HealthRepository } from './health.repository';

/** Result of a health probe: the payload plus whether the service is healthy. */
export interface HealthResult {
  dto: HealthDto;
  healthy: boolean;
}

/**
 * Business logic for the Health module. Aggregates dependency probes into the
 * `/health` contract and exposes build metadata for `/version`. Framework-
 * agnostic: it knows nothing about Express.
 */
export class HealthService {
  constructor(private readonly health: HealthRepository = healthRepository) {}

  /**
   * Probes the database and (when enabled) Redis. The service is considered
   * healthy — and returns HTTP 200 — as long as the database is up; a Redis
   * outage is surfaced as `degraded` but does not fail the check.
   */
  async getHealth(): Promise<HealthResult> {
    const [databaseUp, redis] = await Promise.all([
      this.health.checkDatabase(),
      checkRedisConnection(),
    ]);

    const database = databaseUp ? 'up' : 'down';
    const status = databaseUp && redis !== 'down' ? 'ok' : 'degraded';

    return {
      dto: {
        status,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        checks: { database, redis },
      },
      healthy: databaseUp,
    };
  }

  /** Returns build/version metadata sourced from `package.json` and the env. */
  getVersion(): VersionDto {
    return {
      version: APP_VERSION,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      commit: commitSha,
    };
  }
}

export const healthService = new HealthService();
