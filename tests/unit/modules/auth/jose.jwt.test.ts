import { describe, it, expect } from 'vitest';
import { JoseJwtService } from '#/modules/auth/infrastructure/jose.jwt';

describe('JoseJwtService', () => {
  const secret = 'test-secret-32-chars-minimum-here';
  const jwt = new JoseJwtService(secret);

  it('should sign and verify token', async () => {
    const payload = { sub: 'user-123' };
    const token = await jwt.sign(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const verified = await jwt.verify(token);
    expect(verified.sub).toBe('user-123');
  });

  it('should reject invalid token', async () => {
    await expect(jwt.verify('invalid-token')).rejects.toThrow();
  });

  it('should reject token signed with different secret', async () => {
    const otherJwt = new JoseJwtService('other-secret-32-chars-minimum');
    const token = await otherJwt.sign({ sub: 'user-123' });

    await expect(jwt.verify(token)).rejects.toThrow();
  });
});
