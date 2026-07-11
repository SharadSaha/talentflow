import { useCallback, useSyncExternalStore } from 'react';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { localStorageService } from '@/services/storage/local-storage.service';

/**
 * Session-persistent job bookmarks backed by localStorage. Kept client-only
 * (there is no saved-jobs API yet); a single external store is shared across all
 * cards so every {@link JobCard} reflects the same state without prop drilling.
 */

let bookmarks: ReadonlySet<string> = readBookmarks();
const listeners = new Set<() => void>();

function readBookmarks(): ReadonlySet<string> {
  const raw = localStorageService.get(STORAGE_KEYS.JOB_BOOKMARKS);
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((id): id is string => typeof id === 'string'))
      : new Set();
  } catch {
    return new Set();
  }
}

function persist(next: ReadonlySet<string>): void {
  bookmarks = next;
  localStorageService.set(STORAGE_KEYS.JOB_BOOKMARKS, JSON.stringify([...next]));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface UseJobBookmarksResult {
  isBookmarked: (jobId: string) => boolean;
  toggle: (jobId: string) => boolean;
}

/** Read/toggle job bookmarks. Components re-render when the shared set changes. */
export function useJobBookmarks(): UseJobBookmarksResult {
  const current = useSyncExternalStore(
    subscribe,
    () => bookmarks,
    () => bookmarks,
  );

  const isBookmarked = useCallback((jobId: string) => current.has(jobId), [current]);

  const toggle = useCallback((jobId: string) => {
    const next = new Set(bookmarks);
    const wasBookmarked = next.has(jobId);
    if (wasBookmarked) {
      next.delete(jobId);
    } else {
      next.add(jobId);
    }
    persist(next);
    return !wasBookmarked;
  }, []);

  return { isBookmarked, toggle };
}
