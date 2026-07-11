/**
 * API endpoint paths, relative to the versioned base URL (`/api/v1`) configured
 * on the RTK Query base query. Feature API slices reference these constants so
 * endpoint strings live in exactly one place.
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  PROFILE: {
    ROOT: '/profile',
  },
  JOBS: {
    ROOT: '/jobs',
    byId: (id: string) => `/jobs/${id}`,
    applicants: (id: string) => `/jobs/${id}/applications`,
  },
  HR: {
    JOBS: '/hr/jobs',
  },
  APPLICATIONS: {
    ROOT: '/applications',
    MINE: '/applications/me',
    HR_APPLICANTS: '/applications/hr-applicants',
    status: (id: string) => `/applications/${id}/status`,
    withdraw: (id: string) => `/applications/${id}/withdraw`,
  },
  DASHBOARD: {
    CANDIDATE: '/dashboard/candidate',
    HR: '/dashboard/hr',
  },
} as const;
