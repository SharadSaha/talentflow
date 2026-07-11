import type { EducationLevel } from '@/constants/education';

/**
 * Editable candidate-profile fields, mirroring the backend `PATCH /profile`
 * whitelist. All optional; the backend rejects unknown keys and requires at
 * least one field. Skills and education are read-only (no mutation endpoint).
 */
export interface UpdateProfileRequest {
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
