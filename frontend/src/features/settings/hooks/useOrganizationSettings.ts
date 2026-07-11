import { useCallback, useMemo } from 'react';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { DEFAULT_ORGANIZATION_SETTINGS } from '@/features/settings/constants/settings.constants';
import { usePersistedState } from '@/features/settings/hooks/usePersistedState';
import type { OrganizationSettings } from '@/features/settings/types/preferences.types';

/** The API returned by {@link useOrganizationSettings}. */
export interface UseOrganizationSettingsResult {
  organization: OrganizationSettings;
  /** Persists the organization details locally. */
  save: (next: OrganizationSettings) => void;
}

/**
 * Reads and persists the HR organization details locally. The backend does not
 * expose an organization endpoint yet, so these values are stored client-side
 * and hydrate the organization form on return visits.
 */
export function useOrganizationSettings(): UseOrganizationSettingsResult {
  const { value, setValue } = usePersistedState<OrganizationSettings>(
    STORAGE_KEYS.ORGANIZATION_SETTINGS,
    DEFAULT_ORGANIZATION_SETTINGS,
  );

  const save = useCallback((next: OrganizationSettings) => setValue(next), [setValue]);

  return useMemo(() => ({ organization: value, save }), [value, save]);
}
