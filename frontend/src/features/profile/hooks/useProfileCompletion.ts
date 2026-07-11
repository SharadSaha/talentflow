import type { CandidateProfile } from '@/types/profile';

/**
 * Computes a 0–100 profile-completion percentage from a curated set of
 * high-signal fields. Pure and deterministic so it can drive the completion
 * meter without side effects.
 */
export function useProfileCompletion(profile: CandidateProfile | undefined): number {
  if (!profile) return 0;

  const checks: boolean[] = [
    isFilled(profile.headline),
    isFilled(profile.about),
    isFilled(profile.phone),
    isFilled(profile.currentLocation),
    isFilled(profile.currentTitle),
    profile.totalExperienceMonths > 0,
    profile.highestEducation !== null,
    profile.expectedSalaryMin !== null,
    isFilled(profile.resumeUrl),
    profile.skills.length > 0,
    profile.education.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

/** Whether a nullable string field holds a non-empty value. */
function isFilled(value: string | null): boolean {
  return value !== null && value.trim().length > 0;
}
