import type { EmploymentType } from '@/constants/job';

/**
 * Locally persisted user preferences. These are client-side settings that have
 * no backend counterpart yet, so they live in `localStorage` and are managed
 * through `useUserPreferences`. Every field is strongly typed with a sensible
 * default so the UI can render deterministically on first load.
 */

/** Job-seeking preferences shown on the candidate "Preferences" tab. */
export interface JobSeekingPreferences {
  /** Whether the candidate is actively open to new opportunities. */
  isOpenToWork: boolean;
  /** Employment types the candidate is interested in. */
  employmentTypes: EmploymentType[];
  /** Free-form preferred work locations (e.g. "Remote", "Berlin"). */
  preferredLocations: string[];
}

/** Email / product notification toggles (candidate and HR). */
export interface NotificationPreferences {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  weeklyDigest: boolean;
  productAnnouncements: boolean;
}

/** Candidate profile-visibility toggles. */
export interface PrivacyPreferences {
  visibleToRecruiters: boolean;
  showContactInfo: boolean;
  appearInSearch: boolean;
}

/** The full, typed preferences document persisted for the current user. */
export interface UserPreferences {
  jobSeeking: JobSeekingPreferences;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

/** A single notification toggle definition, driving a config-based row list. */
export interface NotificationOption {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}

/** A single privacy toggle definition. */
export interface PrivacyOption {
  key: keyof PrivacyPreferences;
  label: string;
  description: string;
}

/** Locally persisted HR organization details (no backend endpoint yet). */
export interface OrganizationSettings {
  companyName: string;
  website: string;
  description: string;
}
