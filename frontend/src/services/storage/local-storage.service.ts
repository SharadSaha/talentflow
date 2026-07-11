/**
 * Thin, typed wrapper around `localStorage` that fails safely when storage is
 * unavailable (private mode, SSR, quota exceeded) instead of throwing into the
 * calling code. All persistent client storage goes through this service.
 */
export const localStorageService = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage is unavailable or full — degrade gracefully without persisting.
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing to clean up if storage is inaccessible.
    }
  },
};
