import type { UserRole } from '@/constants/roles';

/**
 * Candidate profile contracts, mirroring the backend `CandidateProfileDto`.
 * Domain enum fields (education/proficiency levels) are typed as strings here;
 * the profile feature will narrow them when its pages are built.
 */

export interface ProfileOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface ProfileSkill {
  id: string;
  name: string;
  slug: string;
  proficiency: string | null;
  yearsOfExperience: number | null;
}

export interface ProfileEducation {
  id: string;
  institution: string;
  degree: string | null;
  level: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  grade: string | null;
}

export interface CandidateProfile {
  id: string;
  user: ProfileOwner;
  headline: string | null;
  about: string | null;
  phone: string | null;
  currentLocation: string | null;
  preferredLocation: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  totalExperienceMonths: number;
  highestEducation: string | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  salaryCurrency: string;
  noticePeriodDays: number | null;
  isOpenToWork: boolean;
  resumeUrl: string | null;
  skills: ProfileSkill[];
  education: ProfileEducation[];
  createdAt: string;
  updatedAt: string;
}
