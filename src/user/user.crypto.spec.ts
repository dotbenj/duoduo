import { createPasswordHash, generateSalt, hashPassword } from './user.crypto';

describe('user.crypto', () => {
  it('generates random salt as hex', () => {
    const salt = generateSalt();
    expect(salt).toMatch(/^[0-9a-f]+$/);
    expect(salt).toHaveLength(32);
  });

  it('hashes deterministically for a given salt', () => {
    expect(hashPassword('password', 'salt')).toBe(
      '58b83037b39e21e4f976bb0f07ad6cf4add7178e23297ecd505ac28d282909bcfd23064a3a1e21b9ece3028ecfa11bd7845d65fd41c82e0e0bd1fe0483c621cb'
    );
  });

  it('creates salt + hash pair', () => {
    const res = createPasswordHash('password');
    expect(res.salt).toMatch(/^[0-9a-f]+$/);
    expect(res.salt).toHaveLength(32);
    expect(res.hash).toHaveLength(128);
    expect(res.hash).toBe(hashPassword('password', res.salt));
  });
});
