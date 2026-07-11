import { comparePassword, hashPassword } from './password.service';

describe('password.service', () => {
  const plainTextPassword = 'Str0ng@Pass';

  it('hashes a password into a bcrypt hash that differs from the plaintext', async () => {
    const hash = await hashPassword(plainTextPassword);

    expect(hash).not.toBe(plainTextPassword);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it('produces different hashes for the same password (unique salts)', async () => {
    const firstHash = await hashPassword(plainTextPassword);
    const secondHash = await hashPassword(plainTextPassword);

    expect(firstHash).not.toBe(secondHash);
  });

  it('confirms a matching password', async () => {
    const hash = await hashPassword(plainTextPassword);

    await expect(comparePassword(plainTextPassword, hash)).resolves.toBe(true);
  });

  it('rejects a non-matching password', async () => {
    const hash = await hashPassword(plainTextPassword);

    await expect(comparePassword('WrongPass@1', hash)).resolves.toBe(false);
  });
});
