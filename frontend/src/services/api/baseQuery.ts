import {
  type BaseQueryFn,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { env } from '@/config/env';
import { sessionExpired } from '@/reducers/authSlice';
import { HTTP_STATUS_UNAUTHORIZED } from '@/services/api/http-status';
import { tokenService } from '@/services/auth/token.service';

/**
 * The raw fetch base query: points at the versioned API base URL and injects
 * the bearer token (when present) as an `Authorization` header on every
 * request. Token reads go through `tokenService` so the storage strategy stays
 * encapsulated.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers) => {
    const token = tokenService.get();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wraps the raw base query to centralise 401 handling: an expired/invalid
 * session clears the persisted token and signs the user out globally, so
 * protected routes redirect to login instead of retrying indefinitely.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === HTTP_STATUS_UNAUTHORIZED) {
    tokenService.clear();
    api.dispatch(sessionExpired());
  }

  return result;
};
