import { USER_ROLE, type UserRole } from '@/constants/roles';

/**
 * Client route paths. Centralised so navigation targets are never hardcoded as
 * string literals. Authentication is split by role (`/auth/candidate/*`,
 * `/auth/hr/*`); authenticated areas are namespaced by role (`/candidate/*`,
 * `/hr/*`) so each role owns a conflict-free route tree that its layout renders.
 */
export const ROUTES = {
  HOME: '/',

  // Role-specific authentication
  AUTH: {
    CANDIDATE_LOGIN: '/auth/candidate/login',
    CANDIDATE_REGISTER: '/auth/candidate/register',
    HR_LOGIN: '/auth/hr/login',
    HR_REGISTER: '/auth/hr/register',
  },

  // Candidate area
  CANDIDATE: {
    ROOT: '/candidate',
    DASHBOARD: '/candidate/dashboard',
    JOBS: '/candidate/jobs',
    JOB_DETAILS: '/candidate/jobs/:id',
    APPLICATIONS: '/candidate/applications',
    PROFILE: '/candidate/profile',
    SETTINGS: '/candidate/settings',
  },

  // HR area
  HR: {
    ROOT: '/hr',
    DASHBOARD: '/hr/dashboard',
    JOBS: '/hr/jobs',
    JOB_NEW: '/hr/jobs/new',
    JOB_EDIT: '/hr/jobs/:id/edit',
    APPLICANTS: '/hr/applicants',
    PROFILE: '/hr/profile',
    SETTINGS: '/hr/settings',
  },

  // System
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

/** Builds the candidate job-details path for a specific job id. */
export function candidateJobDetailsPath(jobId: string): string {
  return `${ROUTES.CANDIDATE.JOBS}/${jobId}`;
}

/** Builds the HR edit-job path for a specific job id. */
export function hrJobEditPath(jobId: string): string {
  return `${ROUTES.HR.JOBS}/${jobId}/edit`;
}

/** Builds the HR applicants path, optionally pre-selecting a job. */
export function hrApplicantsPath(jobId?: string): string {
  return jobId ? `${ROUTES.HR.APPLICANTS}?job=${jobId}` : ROUTES.HR.APPLICANTS;
}

/**
 * The landing route for a signed-in user, used for post-login redirects and to
 * bounce authenticated users away from guest-only pages.
 */
export function getHomeRouteForRole(role: UserRole | null): string {
  if (role === USER_ROLE.HR) return ROUTES.HR.DASHBOARD;
  if (role === USER_ROLE.CANDIDATE) return ROUTES.CANDIDATE.DASHBOARD;
  return ROUTES.HOME;
}

/** The role-appropriate login route (used for logout and session-expiry redirects). */
export function getLoginRouteForRole(role: UserRole | null): string {
  return role === USER_ROLE.HR ? ROUTES.AUTH.HR_LOGIN : ROUTES.AUTH.CANDIDATE_LOGIN;
}

/**
 * Infers the correct login route from an attempted path, preserving role
 * context when an unauthenticated user is redirected (e.g. session expiry).
 */
export function getLoginRouteForPath(pathname: string): string {
  if (pathname.startsWith(ROUTES.HR.ROOT)) return ROUTES.AUTH.HR_LOGIN;
  if (pathname.startsWith(ROUTES.CANDIDATE.ROOT)) return ROUTES.AUTH.CANDIDATE_LOGIN;
  return ROUTES.AUTH.CANDIDATE_LOGIN;
}
