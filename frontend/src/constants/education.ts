import { type SelectOption, toOptions } from '@/utils/options';

/** Education and skill-proficiency vocabulary, mirroring the backend enums. */

export const EDUCATION_LEVEL = {
  HIGH_SCHOOL: 'HIGH_SCHOOL',
  DIPLOMA: 'DIPLOMA',
  BACHELORS: 'BACHELORS',
  MASTERS: 'MASTERS',
  DOCTORATE: 'DOCTORATE',
  OTHER: 'OTHER',
} as const;

export type EducationLevel = (typeof EDUCATION_LEVEL)[keyof typeof EDUCATION_LEVEL];

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  HIGH_SCHOOL: 'High school',
  DIPLOMA: 'Diploma',
  BACHELORS: "Bachelor's degree",
  MASTERS: "Master's degree",
  DOCTORATE: 'Doctorate',
  OTHER: 'Other',
};

export const EDUCATION_LEVEL_OPTIONS: SelectOption<EducationLevel>[] =
  toOptions(EDUCATION_LEVEL_LABELS);

export const PROFICIENCY_LEVEL = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export type ProficiencyLevel = (typeof PROFICIENCY_LEVEL)[keyof typeof PROFICIENCY_LEVEL];

export const PROFICIENCY_LEVEL_LABELS: Record<ProficiencyLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};
