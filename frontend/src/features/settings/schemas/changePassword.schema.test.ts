import { describe, expect, it } from 'vitest';

import { changePasswordSchema } from '@/features/settings/schemas/changePassword.schema';

const valid = {
  currentPassword: 'OldPass123',
  newPassword: 'NewPass456',
  confirmPassword: 'NewPass456',
};

describe('changePasswordSchema', () => {
  it('accepts a valid password change', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('requires the current password', () => {
    expect(changePasswordSchema.safeParse({ ...valid, currentPassword: '' }).success).toBe(false);
  });

  it('rejects a new password that is too short', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: 'Ab1',
      confirmPassword: 'Ab1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a new password missing an uppercase letter', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: 'newpass456',
      confirmPassword: 'newpass456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a new password missing a number', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: 'NewPassword',
      confirmPassword: 'NewPassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a confirmation that does not match', () => {
    const result = changePasswordSchema.safeParse({ ...valid, confirmPassword: 'Different789' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('confirmPassword'))).toBe(
        true,
      );
    }
  });

  it('rejects a new password identical to the current one', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'SamePass123',
      newPassword: 'SamePass123',
      confirmPassword: 'SamePass123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('newPassword'))).toBe(true);
    }
  });
});
