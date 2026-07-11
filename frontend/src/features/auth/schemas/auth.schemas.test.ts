import { describe, expect, it } from 'vitest';

import {
  hrRegisterSchema,
  loginSchema,
  registerSchema,
} from '@/features/auth/schemas/auth.schemas';

describe('loginSchema', () => {
  const validLogin = { email: 'ada@example.com', password: 'anything', rememberMe: false };

  it('accepts a well-formed login', () => {
    expect(loginSchema.safeParse(validLogin).success).toBe(true);
  });

  it('does not enforce password strength on login', () => {
    expect(loginSchema.safeParse({ ...validLogin, password: 'weak' }).success).toBe(true);
  });

  it('rejects a login with an empty password', () => {
    const result = loginSchema.safeParse({ ...validLogin, password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a login with an invalid email', () => {
    expect(loginSchema.safeParse({ ...validLogin, email: 'nope' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validRegistration = {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'Str0ng!Pass',
    confirmPassword: 'Str0ng!Pass',
  };

  it('accepts a complete, valid registration', () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it('rejects a full name with only one token', () => {
    const result = registerSchema.safeParse({ ...validRegistration, fullName: 'Ada' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Enter your first and last name.');
    }
  });

  it('rejects a weak password that fails the strength policy', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'weakpass',
      confirmPassword: 'weakpass',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched password confirmation on the confirm field', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: 'Different1!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('confirmPassword'))).toBe(
        true,
      );
    }
  });

  it('rejects a registration with an invalid email', () => {
    expect(registerSchema.safeParse({ ...validRegistration, email: 'bad' }).success).toBe(false);
  });
});

describe('hrRegisterSchema', () => {
  const validHrRegistration = {
    organizationName: 'Acme Inc.',
    fullName: 'Grace Hopper',
    email: 'grace@acme.com',
    password: 'Str0ng!Pass',
    confirmPassword: 'Str0ng!Pass',
  };

  it('accepts a complete, valid employer registration', () => {
    expect(hrRegisterSchema.safeParse(validHrRegistration).success).toBe(true);
  });

  it('requires the organization name', () => {
    const result = hrRegisterSchema.safeParse({ ...validHrRegistration, organizationName: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('organizationName'))).toBe(
        true,
      );
      expect(result.error.issues[0]?.message).toBe('Organization name is required.');
    }
  });

  it('rejects a whitespace-only organization name', () => {
    const result = hrRegisterSchema.safeParse({ ...validHrRegistration, organizationName: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Organization name is required.');
    }
  });

  it('rejects a single-character organization name', () => {
    const result = hrRegisterSchema.safeParse({ ...validHrRegistration, organizationName: 'A' });
    expect(result.success).toBe(false);
  });

  it('still enforces the shared registration rules (e.g. full name)', () => {
    const result = hrRegisterSchema.safeParse({ ...validHrRegistration, fullName: 'Grace' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === 'Enter your first and last name.'),
      ).toBe(true);
    }
  });
});
