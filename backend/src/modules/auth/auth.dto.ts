import type { UserRole } from '@/generated/prisma/enums';

import type { AuthUserRecord } from './auth.repository';

/**
 * Public representation of a user. Deliberately excludes `passwordHash` and any
 * other sensitive fields so they are never serialised to a client.
 */
export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationName: string | null;
  createdAt: string;
}

/** Result of a successful register/login: the user plus an access token. */
export interface AuthResultDto {
  user: AuthUserDto;
  accessToken: string;
}

/** Maps a persisted user (with relations) to its safe public DTO. */
export function toAuthUserDto(user: AuthUserRecord): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    organizationName: user.hrProfile?.company.name ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
