import { createClient } from 'redis';

import { env, isTest } from '@/config/env';
import { logger } from '@/config/logger';

/**
 * Redis connectivity helper.
 *
 * Redis is optional across the application: when `REDIS_URL` is not configured
 * the client is never created and health reports it as `disabled`. It is also
 * treated as disabled under test so the suite stays deterministic and never
 * opens a real connection. The single lazily-created client is reused so health
 * checks do not open a new connection on every call.
 */
export const isRedisEnabled = Boolean(env.REDIS_URL) && !isTest;

/** Factory for the shared client, used to derive its concrete inferred type. */
function createRedisClient(url: string) {
  return createClient({ url });
}

type RedisClient = ReturnType<typeof createRedisClient>;

let client: RedisClient | null = null;

async function getClient(): Promise<RedisClient | null> {
  if (!isRedisEnabled || !env.REDIS_URL) {
    return null;
  }
  if (client?.isOpen) {
    return client;
  }

  const instance = createRedisClient(env.REDIS_URL);
  instance.on('error', (error: unknown) => {
    logger.error('Redis client error', {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  await instance.connect();
  client = instance;
  return client;
}

/**
 * Reports Redis connectivity for the health endpoint: `disabled` when no URL is
 * configured, `up` on a successful `PING`, `down` on any failure.
 */
export async function checkRedisConnection(): Promise<'up' | 'down' | 'disabled'> {
  if (!isRedisEnabled) {
    return 'disabled';
  }

  try {
    const instance = await getClient();
    if (!instance) {
      return 'disabled';
    }
    const pong = await instance.ping();
    return pong === 'PONG' ? 'up' : 'down';
  } catch {
    return 'down';
  }
}
