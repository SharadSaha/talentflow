import type {
  NotificationOption,
  OrganizationSettings,
  PrivacyOption,
  UserPreferences,
} from '@/features/settings/types/preferences.types';

/**
 * Static configuration for the settings feature: typed default preferences and
 * the option lists that drive the config-based toggle rows. Keeping these in one
 * place means the sections stay presentational and free of hardcoded copy.
 */

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  jobSeeking: {
    isOpenToWork: true,
    employmentTypes: [],
    preferredLocations: [],
  },
  notifications: {
    jobAlerts: true,
    applicationUpdates: true,
    weeklyDigest: false,
    productAnnouncements: false,
  },
  privacy: {
    visibleToRecruiters: true,
    showContactInfo: false,
    appearInSearch: true,
  },
};

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  companyName: '',
  website: '',
  description: '',
};

/** Notification rows surfaced to candidates. */
export const CANDIDATE_NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: 'jobAlerts',
    label: 'Job alerts',
    description: 'Get notified about new roles that match your preferences.',
  },
  {
    key: 'applicationUpdates',
    label: 'Application updates',
    description: 'Receive an email when the status of an application changes.',
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'A weekly summary of relevant jobs and activity.',
  },
  {
    key: 'productAnnouncements',
    label: 'Product announcements',
    description: 'Occasional news about new TalentFlow features.',
  },
];

/** Notification rows surfaced to recruiters. */
export const HR_NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: 'applicationUpdates',
    label: 'New applicant alerts',
    description: 'Get notified when a candidate applies to one of your jobs.',
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly hiring digest',
    description: 'A weekly summary of pipeline activity across your roles.',
  },
  {
    key: 'productAnnouncements',
    label: 'Product announcements',
    description: 'Occasional news about new TalentFlow features.',
  },
];

/** Candidate profile-visibility rows. */
export const PRIVACY_OPTIONS: PrivacyOption[] = [
  {
    key: 'visibleToRecruiters',
    label: 'Visible to recruiters',
    description: 'Allow recruiters to discover and view your profile.',
  },
  {
    key: 'showContactInfo',
    label: 'Show contact information',
    description: 'Display your email and phone number on your profile.',
  },
  {
    key: 'appearInSearch',
    label: 'Appear in candidate search',
    description: 'Include your profile in recruiter search results.',
  },
];
