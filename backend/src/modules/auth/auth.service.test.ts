import { hashPassword } from '@/auth/password.service';
import { AuthenticationError, ConflictError, NotFoundError } from '@/errors';
import { UserRole } from '@/generated/prisma/enums';

import { buildUser } from '../../../tests/fixtures';
import { AuthService } from './auth.service';
import type { UserRepository } from './auth.repository';
import type { RegisterInput } from './auth.schemas';

describe('AuthService', () => {
  const buildRepository = () =>
    ({
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createCandidate: jest.fn(),
      createHr: jest.fn(),
    }) satisfies UserRepository;

  const registerInput: RegisterInput = {
    email: 'new.user@example.com',
    password: 'Str0ng@Pass',
    firstName: 'New',
    lastName: 'User',
    role: UserRole.CANDIDATE,
  };

  describe('register', () => {
    it('creates a candidate, hashes the password, and returns a token', async () => {
      const repository = buildRepository();
      repository.findByEmail.mockResolvedValue(null);
      repository.createCandidate.mockResolvedValue(buildUser({ email: registerInput.email }));
      const service = new AuthService(repository);

      const result = await service.register(registerInput);

      expect(result.user.email).toBe(registerInput.email);
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(repository.createCandidate).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: expect.stringMatching(/^\$2[aby]\$/) }),
      );
      const [createArgs] = repository.createCandidate.mock.calls[0] as [{ passwordHash: string }];
      expect(createArgs.passwordHash).not.toBe(registerInput.password);
    });

    it('throws a ConflictError when the email is already registered', async () => {
      const repository = buildRepository();
      repository.findByEmail.mockResolvedValue(buildUser({ email: registerInput.email }));
      const service = new AuthService(repository);

      await expect(service.register(registerInput)).rejects.toThrow(ConflictError);
      expect(repository.createCandidate).not.toHaveBeenCalled();
    });

    it('creates an HR account bound to an organization when role is HR', async () => {
      const repository = buildRepository();
      repository.findByEmail.mockResolvedValue(null);
      repository.createHr.mockResolvedValue(
        buildUser({
          email: registerInput.email,
          role: UserRole.HR,
          hrProfile: { company: { name: 'Acme Cloud' } },
        }),
      );
      const service = new AuthService(repository);

      const result = await service.register({
        ...registerInput,
        role: UserRole.HR,
        organizationName: 'Acme Cloud',
      });

      expect(result.user.role).toBe(UserRole.HR);
      expect(result.user.organizationName).toBe('Acme Cloud');
      expect(repository.createHr).toHaveBeenCalledWith(
        expect.objectContaining({ organizationName: 'Acme Cloud' }),
      );
      expect(repository.createCandidate).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const password = 'Str0ng@Pass';

    it('returns a token for valid credentials', async () => {
      const repository = buildRepository();
      const passwordHash = await hashPassword(password);
      repository.findByEmail.mockResolvedValue(
        buildUser({ email: 'candidate@example.com', passwordHash }),
      );
      const service = new AuthService(repository);

      const result = await service.login({ email: 'candidate@example.com', password });

      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.user.email).toBe('candidate@example.com');
    });

    it('throws an AuthenticationError for an unknown email', async () => {
      const repository = buildRepository();
      repository.findByEmail.mockResolvedValue(null);
      const service = new AuthService(repository);

      await expect(service.login({ email: 'missing@example.com', password })).rejects.toThrow(
        AuthenticationError,
      );
    });

    it('throws an AuthenticationError for a wrong password', async () => {
      const repository = buildRepository();
      const passwordHash = await hashPassword(password);
      repository.findByEmail.mockResolvedValue(buildUser({ passwordHash }));
      const service = new AuthService(repository);

      await expect(
        service.login({ email: 'candidate@example.com', password: 'WrongPass@1' }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('throws an AuthenticationError for an inactive account', async () => {
      const repository = buildRepository();
      const passwordHash = await hashPassword(password);
      repository.findByEmail.mockResolvedValue(buildUser({ passwordHash, isActive: false }));
      const service = new AuthService(repository);

      await expect(service.login({ email: 'candidate@example.com', password })).rejects.toThrow(
        AuthenticationError,
      );
    });
  });

  describe('getAuthenticatedUser', () => {
    it('returns the public user when found', async () => {
      const repository = buildRepository();
      repository.findById.mockResolvedValue(buildUser());
      const service = new AuthService(repository);

      const user = await service.getAuthenticatedUser('019f0000-0000-7000-8000-000000000001');

      expect(user.id).toBe('019f0000-0000-7000-8000-000000000001');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('throws a NotFoundError when the user does not exist', async () => {
      const repository = buildRepository();
      repository.findById.mockResolvedValue(null);
      const service = new AuthService(repository);

      await expect(service.getAuthenticatedUser('missing')).rejects.toThrow(NotFoundError);
    });
  });
});
