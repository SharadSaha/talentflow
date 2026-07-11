/**
 * Route path constants. The API is versioned under `/api/v1`.
 */
export const API_V1_PREFIX = '/api/v1';

export const AUTH_ROUTES = {
  BASE: '/auth',
  REGISTER: '/register',
  LOGIN: '/login',
  ME: '/me',
} as const;

export const PROFILE_ROUTES = {
  BASE: '/profile',
  ROOT: '/',
} as const;
