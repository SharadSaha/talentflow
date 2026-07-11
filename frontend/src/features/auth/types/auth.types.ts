/**
 * Request payloads for the authentication endpoints. Response payloads reuse
 * the shared `AuthResult` / `User` contracts from `@/types/user`.
 */
import type { UserRole } from '@/constants/roles';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** Omitted (defaults to CANDIDATE) for candidate self-registration; `HR` for employers. */
  role?: UserRole;
  /** Required when registering as HR; identifies the employer/organization. */
  organizationName?: string;
}
