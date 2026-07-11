import type { EducationLevel, ProficiencyLevel, UserRole } from '@/generated/prisma/enums';

import type { CandidateProfileWithRelations } from './profile.repository';

interface ProfileOwnerDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface ProfileSkillDto {
  id: string;
  name: string;
  slug: string;
  proficiency: ProficiencyLevel | null;
  yearsOfExperience: number | null;
}

interface ProfileEducationDto {
  id: string;
  institution: string;
  degree: string | null;
  level: EducationLevel;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  grade: string | null;
}

/** Public representation of a candidate profile returned by the profile API. */
export interface CandidateProfileDto {
  id: string;
  user: ProfileOwnerDto;
  headline: string | null;
  about: string | null;
  phone: string | null;
  currentLocation: string | null;
  preferredLocation: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  totalExperienceMonths: number;
  highestEducation: EducationLevel | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  salaryCurrency: string;
  noticePeriodDays: number | null;
  isOpenToWork: boolean;
  resumeUrl: string | null;
  skills: ProfileSkillDto[];
  education: ProfileEducationDto[];
  createdAt: string;
  updatedAt: string;
}

/** Maps a candidate profile (with relations) to its public DTO. */
export function toCandidateProfileDto(profile: CandidateProfileWithRelations): CandidateProfileDto {
  return {
    id: profile.id,
    user: {
      id: profile.user.id,
      email: profile.user.email,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      role: profile.user.role,
    },
    headline: profile.headline,
    about: profile.about,
    phone: profile.phone,
    currentLocation: profile.currentLocation,
    preferredLocation: profile.preferredLocation,
    currentCompany: profile.currentCompany,
    currentTitle: profile.currentTitle,
    totalExperienceMonths: profile.totalExperienceMonths,
    highestEducation: profile.highestEducation,
    expectedSalaryMin: profile.expectedSalaryMin,
    expectedSalaryMax: profile.expectedSalaryMax,
    salaryCurrency: profile.salaryCurrency,
    noticePeriodDays: profile.noticePeriodDays,
    isOpenToWork: profile.isOpenToWork,
    resumeUrl: profile.resumeUrl,
    skills: profile.skills.map((candidateSkill) => ({
      id: candidateSkill.skill.id,
      name: candidateSkill.skill.name,
      slug: candidateSkill.skill.slug,
      proficiency: candidateSkill.proficiency,
      yearsOfExperience: candidateSkill.yearsOfExperience,
    })),
    education: profile.education.map((entry) => ({
      id: entry.id,
      institution: entry.institution,
      degree: entry.degree,
      level: entry.level,
      fieldOfStudy: entry.fieldOfStudy,
      startYear: entry.startYear,
      endYear: entry.endYear,
      grade: entry.grade,
    })),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
