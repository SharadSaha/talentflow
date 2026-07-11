/**
 * Thin, typed wrapper around `sessionStorage` that fails safely when storage is
 * unavailable. Used for data that should not outlive the browser tab (e.g. a
 * non-persistent auth session when "remember me" is unchecked).
 */
export const sessionStorageService = {
  get(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Storage is unavailable or full — degrade gracefully without persisting.
    }
  },

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Nothing to clean up if storage is inaccessible.
    }
  },
};
