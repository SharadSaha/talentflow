import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

import { env, isProduction } from '@/config/env';

/**
 * Single, shared Prisma Client instance.
 *
 * Repositories are the only layer permitted to import this module; controllers
 * and services must never access Prisma directly (see backend architecture).
 *
 * Prisma 7 connects through a driver adapter (`@prisma/adapter-pg`) rather than
 * an embedded engine, so the PostgreSQL connection string is passed explicitly.
 *
 * In development the instance is cached on `globalThis` so that hot-reloading
 * (nodemon/tsx) does not exhaust the database connection pool by creating a new
 * client on every reload.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  if (!env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Set it in the environment before using the database.',
    );
  }

  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
