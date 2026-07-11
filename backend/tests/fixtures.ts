import type { User } from '@/generated/prisma/client';
import { EducationLevel, ProficiencyLevel, UserRole } from '@/generated/prisma/enums';
import type { CandidateProfileWithRelations } from '@/modules/candidate-profile/profile.repository';

const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

/** Builds a deterministic `User` entity for tests. */
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: '019f0000-0000-7000-8000-000000000001',
    email: 'candidate@example.com',
    passwordHash: '$2b$12$abcdefghijklmnopqrstuv0123456789012345678901234567890',
    firstName: 'Test',
    lastName: 'Candidate',
    role: UserRole.CANDIDATE,
    isActive: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  };
}

/** Builds a deterministic candidate profile (with relations) for tests. */
export function buildCandidateProfile(
  overrides: Partial<CandidateProfileWithRelations> = {},
): CandidateProfileWithRelations {
  return {
    id: '019f0000-0000-7000-8000-0000000000a1',
    userId: '019f0000-0000-7000-8000-000000000001',
    headline: 'Senior Full-Stack Engineer',
    about: 'Experienced engineer.',
    phone: '+91 90000 00000',
    currentLocation: 'Bengaluru, India',
    preferredLocation: 'Remote',
    currentCompany: 'Techwave Solutions',
    currentTitle: 'Senior Software Engineer',
    totalExperienceMonths: 72,
    highestEducation: EducationLevel.MASTERS,
    expectedSalaryMin: 2800000,
    expectedSalaryMax: 3600000,
    salaryCurrency: 'INR',
    noticePeriodDays: 60,
    isOpenToWork: true,
    resumeUrl: null,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    user: {
      id: '019f0000-0000-7000-8000-000000000001',
      email: 'candidate@example.com',
      firstName: 'Test',
      lastName: 'Candidate',
      role: UserRole.CANDIDATE,
    },
    skills: [
      {
        id: '019f0000-0000-7000-8000-0000000000b1',
        candidateProfileId: '019f0000-0000-7000-8000-0000000000a1',
        skillId: '019f0000-0000-7000-8000-0000000000c1',
        proficiency: ProficiencyLevel.ADVANCED,
        yearsOfExperience: 5,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
        skill: {
          id: '019f0000-0000-7000-8000-0000000000c1',
          name: 'React',
          slug: 'react',
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        },
      },
    ],
    education: [
      {
        id: '019f0000-0000-7000-8000-0000000000d1',
        candidateProfileId: '019f0000-0000-7000-8000-0000000000a1',
        institution: 'Indian Institute of Technology, Bombay',
        degree: 'M.Tech',
        level: EducationLevel.MASTERS,
        fieldOfStudy: 'Computer Science',
        startYear: 2016,
        endYear: 2018,
        grade: null,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      },
    ],
    ...overrides,
  };
}
