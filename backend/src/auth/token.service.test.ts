import { AuthenticationError } from '@/errors';
import { UserRole } from '@/generated/prisma/enums';
import type { AuthUser } from '@/types/auth';

import { signAccessToken, verifyAccessToken } from './token.service';

describe('token.service', () => {
  const user: AuthUser = {
    id: '019f0000-0000-7000-8000-000000000001',
    email: 'candidate@example.com',
    role: UserRole.CANDIDATE,
  };

  it('signs a token that can be verified back into the same principal', () => {
    const token = signAccessToken(user);

    expect(typeof token).toBe('string');
    expect(verifyAccessToken(token)).toEqual(user);
  });

  it('throws an AuthenticationError for a malformed token', () => {
    expect(() => verifyAccessToken('not-a-real-token')).toThrow(AuthenticationError);
  });

  it('throws an AuthenticationError for a tampered token', () => {
    const token = signAccessToken(user);
    const tampered = `${token}tampered`;

    expect(() => verifyAccessToken(tampered)).toThrow(AuthenticationError);
  });
});
