import { prisma } from '@/database/prisma';

/**
 * Persistence contract for health checks. Kept behind an interface so the
 * service can be unit-/integration-tested without a live database.
 */
export interface HealthRepository {
  checkDatabase(): Promise<boolean>;
}

class PrismaHealthRepository implements HealthRepository {
  /**
   * Runs a lightweight `SELECT 1` to confirm the database is reachable. Any
   * error is swallowed and reported as "down" so the health endpoint stays fast
   * and never throws.
   */
  async checkDatabase(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

export const healthRepository: HealthRepository = new PrismaHealthRepository();
