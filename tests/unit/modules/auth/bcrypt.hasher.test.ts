import { describe, it, expect } from 'vitest';
import { BcryptHasher } from '#/modules/auth/infrastructure/bcrypt.hasher';

describe('BcryptHasher', () => {
  const hasher = new BcryptHasher();

  it('should hash password', async () => {
    const password = 'testpassword123';
    const hash = await hasher.hash(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('should verify correct password', async () => {
    const password = 'testpassword123';
    const hash = await hasher.hash(password);

    const result = await hasher.verify(password, hash);
    expect(result).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testpassword123';
    const hash = await hasher.hash(password);

    const result = await hasher.verify('wrongpassword', hash);
    expect(result).toBe(false);
  });
});
