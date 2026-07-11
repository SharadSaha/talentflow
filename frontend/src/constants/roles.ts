/**
 * User roles. Mirrors the backend `UserRole` enum and drives role-based route
 * guards on the client (authorization is always re-enforced server-side).
 */
export const USER_ROLE = {
  HR: 'HR',
  CANDIDATE: 'CANDIDATE',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/** Human-readable labels for display in the UI. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLE.HR]: 'HR',
  [USER_ROLE.CANDIDATE]: 'Candidate',
};
