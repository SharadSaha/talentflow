import { prisma } from '@/database/prisma';
import type { EducationLevel } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

/**
 * The relations always loaded with a candidate profile so the API can return a
 * complete view (owning user, skills, education) in a single query.
 */
const profileInclude = {
  user: {
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  },
  skills: { include: { skill: true } },
  education: true,
} satisfies Prisma.CandidateProfileInclude;

export type CandidateProfileWithRelations = Prisma.CandidateProfileGetPayload<{
  include: typeof profileInclude;
}>;

/**
 * The set of profile fields a candidate is allowed to update. Listing them
 * explicitly (rather than accepting an open object) prevents mass assignment of
 * columns such as `userId`.
 */
export interface UpdateCandidateProfileData {
  headline?: string;
  about?: string;
  phone?: string;
  currentLocation?: string;
  preferredLocation?: string;
  currentCompany?: string;
  currentTitle?: string;
  totalExperienceMonths?: number;
  highestEducation?: EducationLevel;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  noticePeriodDays?: number;
  isOpenToWork?: boolean;
  resumeUrl?: string;
}

/** Persistence contract for candidate profiles. */
export interface CandidateProfileRepository {
  findByUserId(userId: string): Promise<CandidateProfileWithRelations | null>;
  updateByUserId(
    userId: string,
    data: UpdateCandidateProfileData,
  ): Promise<CandidateProfileWithRelations>;
}

class PrismaCandidateProfileRepository implements CandidateProfileRepository {
  findByUserId(userId: string): Promise<CandidateProfileWithRelations | null> {
    return prisma.candidateProfile.findUnique({
      where: { userId },
      include: profileInclude,
    });
  }

  updateByUserId(
    userId: string,
    data: UpdateCandidateProfileData,
  ): Promise<CandidateProfileWithRelations> {
    return prisma.candidateProfile.update({
      where: { userId },
      data,
      include: profileInclude,
    });
  }
}

export const candidateProfileRepository: CandidateProfileRepository =
  new PrismaCandidateProfileRepository();
