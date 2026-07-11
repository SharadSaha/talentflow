import type { UserRole } from '@/constants/roles';

/**
 * Authenticated user, mirroring the backend `AuthUserDto`. Never contains
 * sensitive fields (e.g. password hashes) — those are not exposed by the API.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  /** Employer/organization name. Set for HR users; `null` for candidates. */
  organizationName: string | null;
  createdAt: string;
}

/** Payload returned by register/login: the user plus a bearer access token. */
export interface AuthResult {
  user: User;
  accessToken: string;
}
