import { prisma } from '@/database/prisma';
import type { User } from '@/generated/prisma/client';
import { UserRole } from '@/generated/prisma/enums';

/** Data required to create a new candidate account. */
export interface CreateCandidateData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

/**
 * Persistence contract for user accounts. Depending on the interface (rather
 * than the concrete Prisma implementation) keeps the service layer testable and
 * decoupled from the ORM.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  createCandidate(data: CreateCandidateData): Promise<User>;
}

class PrismaUserRepository implements UserRepository {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Creates a candidate `User` together with its empty `CandidateProfile` in a
   * single nested write, which Prisma executes atomically. The role is fixed to
   * CANDIDATE — HR accounts are created only via the seed script.
   */
  createCandidate(data: CreateCandidateData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.CANDIDATE,
        candidateProfile: { create: {} },
      },
    });
  }
}

export const userRepository: UserRepository = new PrismaUserRepository();
