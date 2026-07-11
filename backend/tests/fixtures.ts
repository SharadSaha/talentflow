import type { User } from '@/generated/prisma/client';
import {
  ApplicationStatus,
  EducationLevel,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  LocationType,
  ProficiencyLevel,
  SalaryPeriod,
  UserRole,
} from '@/generated/prisma/enums';
import type {
  ApplicantWithProfile,
  ApplicationWithJob,
} from '@/modules/applications/application.repository';
import type { CandidateProfileWithRelations } from '@/modules/candidate-profile/profile.repository';
import type { JobWithRelations } from '@/modules/jobs/job.repository';

const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

export const HR_USER_ID = '019f0000-0000-7000-8000-0000000000f0';
export const CANDIDATE_USER_ID = '019f0000-0000-7000-8000-000000000001';
export const CANDIDATE_PROFILE_ID = '019f0000-0000-7000-8000-0000000000a1';
export const COMPANY_ID = '019f0000-0000-7000-8000-0000000000e1';
export const JOB_ID = '019f0000-0000-7000-8000-000000000010';
export const APPLICATION_ID = '019f0000-0000-7000-8000-000000000020';

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

/** Builds a deterministic job (with relations) for tests. */
export function buildJob(overrides: Partial<JobWithRelations> = {}): JobWithRelations {
  return {
    id: JOB_ID,
    companyId: COMPANY_ID,
    postedById: HR_USER_ID,
    title: 'Senior Full-Stack Engineer',
    description: 'Build and own features end to end.',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    locationType: LocationType.HYBRID,
    location: 'Bengaluru, India',
    minExperienceYears: 5,
    maxExperienceYears: 9,
    salaryMin: 2800000,
    salaryMax: 4000000,
    salaryCurrency: 'INR',
    salaryPeriod: SalaryPeriod.YEARLY,
    openings: 2,
    status: JobStatus.PUBLISHED,
    publishedAt: FIXED_DATE,
    expiresAt: null,
    deletedAt: null,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    company: {
      id: COMPANY_ID,
      name: 'Acme Cloud',
      slug: 'acme-cloud',
      logoUrl: null,
      location: 'Bengaluru, India',
      industry: 'Cloud Infrastructure',
    },
    skills: [
      {
        id: '019f0000-0000-7000-8000-000000000031',
        jobId: JOB_ID,
        skillId: '019f0000-0000-7000-8000-0000000000c1',
        isRequired: true,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
        skill: { id: '019f0000-0000-7000-8000-0000000000c1', name: 'React', slug: 'react' },
      },
    ],
    _count: { applications: 3 },
    ...overrides,
  };
}

/** Builds a candidate's application (with its job summary) for tests. */
export function buildApplicationWithJob(
  overrides: Partial<ApplicationWithJob> = {},
): ApplicationWithJob {
  return {
    id: APPLICATION_ID,
    jobId: JOB_ID,
    candidateProfileId: CANDIDATE_PROFILE_ID,
    status: ApplicationStatus.APPLIED,
    coverLetter: 'I am excited about this role.',
    resumeUrl: null,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    job: {
      id: JOB_ID,
      title: 'Senior Full-Stack Engineer',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      locationType: LocationType.HYBRID,
      location: 'Bengaluru, India',
      salaryMin: 2800000,
      salaryMax: 4000000,
      salaryCurrency: 'INR',
      salaryPeriod: SalaryPeriod.YEARLY,
      status: JobStatus.PUBLISHED,
      company: {
        id: COMPANY_ID,
        name: 'Acme Cloud',
        slug: 'acme-cloud',
        logoUrl: null,
        location: 'Bengaluru, India',
      },
    },
    ...overrides,
  };
}

/** Builds an applicant (application + candidate profile) for tests. */
export function buildApplicantWithProfile(
  overrides: Partial<ApplicantWithProfile> = {},
): ApplicantWithProfile {
  return {
    id: APPLICATION_ID,
    jobId: JOB_ID,
    candidateProfileId: CANDIDATE_PROFILE_ID,
    status: ApplicationStatus.APPLIED,
    coverLetter: null,
    resumeUrl: null,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    candidateProfile: {
      id: CANDIDATE_PROFILE_ID,
      userId: CANDIDATE_USER_ID,
      headline: 'Senior Full-Stack Engineer',
      about: null,
      phone: null,
      currentLocation: 'Bengaluru, India',
      preferredLocation: 'Remote',
      currentCompany: 'Techwave Solutions',
      currentTitle: 'Senior Software Engineer',
      totalExperienceMonths: 72,
      highestEducation: EducationLevel.MASTERS,
      expectedSalaryMin: null,
      expectedSalaryMax: null,
      salaryCurrency: 'INR',
      noticePeriodDays: null,
      isOpenToWork: true,
      resumeUrl: null,
      createdAt: FIXED_DATE,
      updatedAt: FIXED_DATE,
      user: {
        id: CANDIDATE_USER_ID,
        email: 'candidate@example.com',
        firstName: 'Test',
        lastName: 'Candidate',
      },
      skills: [
        {
          id: '019f0000-0000-7000-8000-0000000000b1',
          candidateProfileId: CANDIDATE_PROFILE_ID,
          skillId: '019f0000-0000-7000-8000-0000000000c1',
          proficiency: ProficiencyLevel.ADVANCED,
          yearsOfExperience: 5,
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
          skill: { id: '019f0000-0000-7000-8000-0000000000c1', name: 'React', slug: 'react' },
        },
      ],
      education: [
        {
          id: '019f0000-0000-7000-8000-0000000000d1',
          institution: 'Indian Institute of Technology, Bombay',
          degree: 'M.Tech',
          level: EducationLevel.MASTERS,
          fieldOfStudy: 'Computer Science',
          startYear: 2016,
          endYear: 2018,
        },
      ],
    },
    ...overrides,
  };
}
