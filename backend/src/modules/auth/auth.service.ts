import { comparePassword, hashPassword } from '@/auth/password.service';
import { signAccessToken } from '@/auth/token.service';
import { AuthenticationError, ConflictError, NotFoundError } from '@/errors';
import type { User } from '@/generated/prisma/client';

import type { AuthResultDto, AuthUserDto } from './auth.dto';
import { toAuthUserDto } from './auth.dto';
import { userRepository } from './auth.repository';
import type { UserRepository } from './auth.repository';
import type { LoginInput, RegisterInput } from './auth.schemas';

/**
 * Business logic for authentication. Framework-agnostic: it knows nothing about
 * Express and depends on the repository through its interface, which makes it
 * straightforward to unit test with a mock repository.
 */
export class AuthService {
  constructor(private readonly users: UserRepository = userRepository) {}

  /**
   * Registers a new candidate account. Fails with a conflict if the email is
   * already taken. Passwords are hashed before persistence.
   */
  async register(input: RegisterInput): Promise<AuthResultDto> {
    const existingUser = await this.users.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.users.createCandidate({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    return this.buildAuthResult(user);
  }

  /**
   * Authenticates a user by email and password. A single generic message is
   * used for both "unknown email" and "wrong password" to avoid leaking which
   * accounts exist (user enumeration).
   */
  async login(input: LoginInput): Promise<AuthResultDto> {
    const invalidCredentials = new AuthenticationError('Invalid email or password.');

    const user = await this.users.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw invalidCredentials;
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials;
    }

    return this.buildAuthResult(user);
  }

  /** Returns the public profile of the currently authenticated user. */
  async getAuthenticatedUser(userId: string): Promise<AuthUserDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return toAuthUserDto(user);
  }

  private buildAuthResult(user: User): AuthResultDto {
    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    return { user: toAuthUserDto(user), accessToken };
  }
}

export const authService = new AuthService();
