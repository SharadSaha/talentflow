import { prisma } from '@/database/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { UserRole } from '@/generated/prisma/enums';

/** Relations loaded with a user so the auth DTO can expose an HR's organization. */
export const authUserInclude = {
  hrProfile: { select: { company: { select: { name: true } } } },
} satisfies Prisma.UserInclude;

/** A user with the relations required to build {@link AuthUserDto}. */
export type AuthUserRecord = Prisma.UserGetPayload<{ include: typeof authUserInclude }>;

/** Data required to create a new candidate account. */
export interface CreateCandidateData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

/** Data required to create a new HR account bound to an organization. */
export interface CreateHrData extends CreateCandidateData {
  organizationName: string;
}

/**
 * Persistence contract for user accounts. Depending on the interface (rather
 * than the concrete Prisma implementation) keeps the service layer testable and
 * decoupled from the ORM.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: string): Promise<AuthUserRecord | null>;
  createCandidate(data: CreateCandidateData): Promise<AuthUserRecord>;
  createHr(data: CreateHrData): Promise<AuthUserRecord>;
}

/** Builds a URL-safe slug from an organization name. */
function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug.length > 0 ? slug : 'organization';
}

/**
 * Resolves a slug that is unique across companies, appending a numeric suffix
 * on collision. Runs inside the caller's transaction to stay consistent.
 */
async function generateUniqueSlug(tx: Prisma.TransactionClient, name: string): Promise<string> {
  const root = slugify(name);
  let candidate = root;
  let suffix = 1;

  while (await tx.company.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

class PrismaUserRepository implements UserRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null> {
    return prisma.user.findUnique({ where: { email }, include: authUserInclude });
  }

  findById(id: string): Promise<AuthUserRecord | null> {
    return prisma.user.findUnique({ where: { id }, include: authUserInclude });
  }

  /**
   * Creates a candidate `User` together with its empty `CandidateProfile` in a
   * single nested write, which Prisma executes atomically. The role is fixed to
   * CANDIDATE.
   */
  createCandidate(data: CreateCandidateData): Promise<AuthUserRecord> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.CANDIDATE,
        candidateProfile: { create: {} },
      },
      include: authUserInclude,
    });
  }

  /**
   * Creates an HR `User` bound to an organization. The company is matched by a
   * case-insensitive name (find-or-create, generating a unique slug when new),
   * then the user and its `HrProfile` are created — all in one transaction so
   * the account is never left without its organization.
   */
  createHr(data: CreateHrData): Promise<AuthUserRecord> {
    return prisma.$transaction(async (tx) => {
      const existingCompany = await tx.company.findFirst({
        where: { name: { equals: data.organizationName, mode: 'insensitive' } },
        select: { id: true },
      });

      const companyId =
        existingCompany?.id ??
        (
          await tx.company.create({
            data: {
              name: data.organizationName,
              slug: await generateUniqueSlug(tx, data.organizationName),
            },
            select: { id: true },
          })
        ).id;

      return tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.HR,
          hrProfile: { create: { company: { connect: { id: companyId } } } },
        },
        include: authUserInclude,
      });
    });
  }
}

export const userRepository: UserRepository = new PrismaUserRepository();
