import { USER_ROLE, type UserRole } from '@/constants/roles';

/**
 * Client route paths. Centralised so navigation targets are never hardcoded as
 * string literals. Authenticated areas are namespaced by role (`/candidate/*`,
 * `/hr/*`) so each role owns a conflict-free route tree that its layout renders.
 */
export const ROUTES = {
  HOME: '/',

  // Guest / auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Candidate area
  CANDIDATE: {
    ROOT: '/candidate',
    DASHBOARD: '/candidate/dashboard',
    JOBS: '/candidate/jobs',
    APPLICATIONS: '/candidate/applications',
    PROFILE: '/candidate/profile',
  },

  // HR area
  HR: {
    ROOT: '/hr',
    DASHBOARD: '/hr/dashboard',
    JOBS: '/hr/jobs',
    APPLICANTS: '/hr/applicants',
    PROFILE: '/hr/profile',
  },

  // System
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

/**
 * The landing route for a signed-in user, used for post-login redirects and to
 * bounce authenticated users away from guest-only pages.
 */
export function getHomeRouteForRole(role: UserRole | null): string {
  if (role === USER_ROLE.HR) return ROUTES.HR.DASHBOARD;
  if (role === USER_ROLE.CANDIDATE) return ROUTES.CANDIDATE.DASHBOARD;
  return ROUTES.LOGIN;
}
