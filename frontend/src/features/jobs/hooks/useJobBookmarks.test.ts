import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storage-keys';

/**
 * The hook is backed by a module-level store, so each test loads a fresh module
 * instance (via `vi.resetModules`) reading a cleared localStorage.
 */
async function loadHook() {
  const module = await import('@/features/jobs/hooks/useJobBookmarks');
  return module.useJobBookmarks;
}

describe('useJobBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('reports no bookmarks initially', async () => {
    const useJobBookmarks = await loadHook();
    const { result } = renderHook(() => useJobBookmarks());

    expect(result.current.isBookmarked('job-1')).toBe(false);
  });

  it('toggles a bookmark on, persists it, and toggles it back off', async () => {
    const useJobBookmarks = await loadHook();
    const { result } = renderHook(() => useJobBookmarks());

    act(() => {
      expect(result.current.toggle('job-1')).toBe(true);
    });
    expect(result.current.isBookmarked('job-1')).toBe(true);

    const stored = localStorage.getItem(STORAGE_KEYS.JOB_BOOKMARKS);
    expect(stored ? (JSON.parse(stored) as string[]) : []).toContain('job-1');

    act(() => {
      expect(result.current.toggle('job-1')).toBe(false);
    });
    expect(result.current.isBookmarked('job-1')).toBe(false);
  });

  it('hydrates existing bookmarks from localStorage', async () => {
    localStorage.setItem(STORAGE_KEYS.JOB_BOOKMARKS, JSON.stringify(['job-9']));

    const useJobBookmarks = await loadHook();
    const { result } = renderHook(() => useJobBookmarks());

    expect(result.current.isBookmarked('job-9')).toBe(true);
  });

  it('ignores malformed stored data without throwing', async () => {
    localStorage.setItem(STORAGE_KEYS.JOB_BOOKMARKS, 'not-json');

    const useJobBookmarks = await loadHook();
    const { result } = renderHook(() => useJobBookmarks());

    expect(result.current.isBookmarked('job-1')).toBe(false);
  });
});
