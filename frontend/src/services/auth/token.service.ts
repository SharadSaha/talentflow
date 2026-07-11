import { STORAGE_KEYS } from '@/constants/storage-keys';
import { localStorageService } from '@/services/storage/local-storage.service';

/**
 * Access-token persistence.
 *
 * The backend issues a bearer access token in the login/register response body
 * (no HttpOnly refresh-cookie flow exists), so the SPA must persist it to keep
 * the user signed in across reloads. We isolate that decision here: the base
 * query and auth bootstrap read the token exclusively through this service, so
 * the storage strategy can change in one place if the backend adopts cookies.
 */
export const tokenService = {
  get(): string | null {
    return localStorageService.get(STORAGE_KEYS.ACCESS_TOKEN);
  },

  set(token: string): void {
    localStorageService.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  clear(): void {
    localStorageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
  },
};
