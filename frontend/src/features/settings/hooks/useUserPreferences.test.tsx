import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { DEFAULT_USER_PREFERENCES } from '@/features/settings/constants/settings.constants';
import { useUserPreferences } from '@/features/settings/hooks/useUserPreferences';

afterEach(() => {
  window.localStorage.clear();
});

describe('useUserPreferences', () => {
  it('returns the typed defaults when nothing is persisted', () => {
    const { result } = renderHook(() => useUserPreferences());

    expect(result.current.preferences).toEqual(DEFAULT_USER_PREFERENCES);
  });

  it('patches a single section without disturbing the others', () => {
    const { result } = renderHook(() => useUserPreferences());

    act(() => {
      result.current.updateSection('notifications', { weeklyDigest: true });
    });

    expect(result.current.preferences.notifications.weeklyDigest).toBe(true);
    expect(result.current.preferences.privacy).toEqual(DEFAULT_USER_PREFERENCES.privacy);
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useUserPreferences());

    act(() => {
      result.current.updateSection('jobSeeking', { isOpenToWork: false });
    });

    const stored = window.localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored ?? '{}').jobSeeking.isOpenToWork).toBe(false);
  });

  it('hydrates persisted preferences on mount', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES,
      JSON.stringify({
        ...DEFAULT_USER_PREFERENCES,
        privacy: { ...DEFAULT_USER_PREFERENCES.privacy, appearInSearch: false },
      }),
    );

    const { result } = renderHook(() => useUserPreferences());

    expect(result.current.preferences.privacy.appearInSearch).toBe(false);
  });

  it('restores defaults and clears storage on reset', () => {
    const { result } = renderHook(() => useUserPreferences());

    act(() => {
      result.current.updateSection('notifications', { jobAlerts: false });
      result.current.reset();
    });

    expect(result.current.preferences).toEqual(DEFAULT_USER_PREFERENCES);
    expect(window.localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)).toBeNull();
  });
});
