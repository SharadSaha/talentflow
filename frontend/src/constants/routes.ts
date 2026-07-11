/**
 * Client route paths. Centralised so navigation targets are never hardcoded as
 * string literals throughout the app. Feature routes are added here as modules
 * are implemented.
 */
export const ROUTES = {
  HOME: '/',

  // Public / auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Authenticated
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  APPLICATIONS: '/applications',
  PROFILE: '/profile',

  // System
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
