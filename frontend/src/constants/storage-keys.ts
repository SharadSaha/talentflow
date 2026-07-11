/**
 * Namespaced `localStorage` keys. Centralised to avoid collisions and typos.
 */
export const STORAGE_KEYS = {
  THEME: 'talentflow.theme',
  ACCESS_TOKEN: 'talentflow.access-token',
  SIDEBAR_COLLAPSED: 'talentflow.sidebar-collapsed',
  USER_PREFERENCES: 'talentflow.user-preferences',
  ORGANIZATION_SETTINGS: 'talentflow.organization-settings',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
