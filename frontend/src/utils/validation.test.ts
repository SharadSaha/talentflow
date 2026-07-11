import { describe, expect, it } from 'vitest';

import { emailField, isNonEmpty, nameField, passwordField } from '@/utils/validation';

describe('emailField', () => {
  it('accepts a valid email', () => {
    expect(emailField.safeParse('ada@example.com').success).toBe(true);
  });

  it('trims and lowercases the parsed value', () => {
    const result = emailField.safeParse('  Ada@Example.COM  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('ada@example.com');
    }
  });

  it('rejects a malformed email', () => {
    expect(emailField.safeParse('not-an-email').success).toBe(false);
  });
});

describe('passwordField', () => {
  it('accepts a strong password meeting every character class', () => {
    expect(passwordField.safeParse('Str0ng!Pass').success).toBe(true);
  });

  it('rejects a password shorter than the minimum length', () => {
    expect(passwordField.safeParse('Ab1!').success).toBe(false);
  });

  it('rejects a password missing an uppercase letter', () => {
    expect(passwordField.safeParse('str0ng!pass').success).toBe(false);
  });

  it('rejects a password missing a digit', () => {
    expect(passwordField.safeParse('Strong!Pass').success).toBe(false);
  });

  it('rejects a password missing a special character', () => {
    expect(passwordField.safeParse('Str0ngPass').success).toBe(false);
  });
});

describe('nameField', () => {
  it('accepts a non-empty name and trims it', () => {
    const result = nameField('First name').safeParse('  Ada  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Ada');
    }
  });

  it('rejects an empty name with a label-specific message', () => {
    const result = nameField('First name').safeParse('   ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('First name is required.');
    }
  });

  it('rejects a name exceeding the maximum length', () => {
    expect(nameField('First name', 5).safeParse('Alexander').success).toBe(false);
  });
});

describe('isNonEmpty', () => {
  it('returns true for a string with visible characters', () => {
    expect(isNonEmpty('hello')).toBe(true);
  });

  it('returns false for a whitespace-only string', () => {
    expect(isNonEmpty('   ')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isNonEmpty('')).toBe(false);
  });
});
