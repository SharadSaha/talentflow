import { useCallback, useMemo } from 'react';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { DEFAULT_USER_PREFERENCES } from '@/features/settings/constants/settings.constants';
import { usePersistedState } from '@/features/settings/hooks/usePersistedState';
import type { UserPreferences } from '@/features/settings/types/preferences.types';

/** The API returned by {@link useUserPreferences}. */
export interface UseUserPreferencesResult {
  preferences: UserPreferences;
  /**
   * Merges a partial patch into a single preferences section. Typed so callers
   * can only patch keys that belong to the addressed section.
   */
  updateSection: <TSection extends keyof UserPreferences>(
    section: TSection,
    patch: Partial<UserPreferences[TSection]>,
  ) => void;
  /** Restores every preference to its default value. */
  reset: () => void;
}

/**
 * Reads and persists the current user's local preferences (job-seeking,
 * notifications, privacy) via the shared storage service. Server state is never
 * duplicated here — these are purely client-side settings with no backend
 * endpoint. Sections update a single slice at a time through `updateSection`.
 */
export function useUserPreferences(): UseUserPreferencesResult {
  const { value, setValue, reset } = usePersistedState<UserPreferences>(
    STORAGE_KEYS.USER_PREFERENCES,
    DEFAULT_USER_PREFERENCES,
  );

  const updateSection = useCallback<UseUserPreferencesResult['updateSection']>(
    (section, patch) => {
      setValue((previous) => ({
        ...previous,
        [section]: { ...previous[section], ...patch },
      }));
    },
    [setValue],
  );

  return useMemo(
    () => ({ preferences: value, updateSection, reset }),
    [value, updateSection, reset],
  );
}
