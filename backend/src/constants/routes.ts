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

export const JOB_ROUTES = {
  BASE: '/jobs',
  ROOT: '/',
  BY_ID: '/:id',
  APPLICANTS: '/:id/applications',
} as const;

export const HR_ROUTES = {
  BASE: '/hr',
  JOBS: '/jobs',
} as const;

export const APPLICATION_ROUTES = {
  BASE: '/applications',
  ROOT: '/',
  MINE: '/me',
  HR_APPLICANTS: '/hr-applicants',
  STATUS: '/:id/status',
  WITHDRAW: '/:id/withdraw',
} as const;

export const DASHBOARD_ROUTES = {
  BASE: '/dashboard',
  CANDIDATE: '/candidate',
  HR: '/hr',
} as const;
