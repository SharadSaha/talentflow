/**
 * Request payloads for the authentication endpoints. Response payloads reuse
 * the shared `AuthResult` / `User` contracts from `@/types/user`.
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
