import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '@/services/api/baseQuery';

/**
 * The single RTK Query API slice. Every feature injects its endpoints into this
 * base via `baseApi.injectEndpoints`, so the app has exactly one API client,
 * one cache, and one shared set of cache tags.
 *
 * Register new invalidation tags here as feature endpoints are added.
 */
export const CACHE_TAGS = {
  Job: 'Job',
  Application: 'Application',
  Profile: 'Profile',
  Dashboard: 'Dashboard',
  CurrentUser: 'CurrentUser',
} as const;

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(CACHE_TAGS),
  endpoints: () => ({}),
});
