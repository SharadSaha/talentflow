import { STORAGE_KEYS } from '@/constants/storage-keys';
import { localStorageService } from '@/services/storage/local-storage.service';
import { sessionStorageService } from '@/services/storage/session-storage.service';

/**
 * Access-token persistence with a "remember me" strategy.
 *
 * The backend issues a bearer access token in the login/register response body
 * (there is no HttpOnly refresh-cookie flow), so the SPA persists it to keep the
 * user signed in across reloads. "Remember me" chooses the durability:
 * `localStorage` survives browser restarts; `sessionStorage` is cleared when the
 * tab closes. Reads check both. All token access goes through this service so
 * the strategy stays encapsulated.
 */
export const tokenService = {
  get(): string | null {
    return (
      localStorageService.get(STORAGE_KEYS.ACCESS_TOKEN) ??
      sessionStorageService.get(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },

  set(token: string, remember = true): void {
    // Clear the other store first so a single token location is authoritative.
    if (remember) {
      sessionStorageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
      localStorageService.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      localStorageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorageService.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    }
  },

  clear(): void {
    localStorageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
  },
};
