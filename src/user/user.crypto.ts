import * as crypto from 'node:crypto';

const PBKDF2_ITERATIONS = 120_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';
const SALT_BYTES = 16;

export function generateSalt(): string {
  return crypto.randomBytes(SALT_BYTES).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString('hex');
}

export function createPasswordHash(password: string): { salt: string; hash: string } {
  const salt = generateSalt();
  return { salt, hash: hashPassword(password, salt) };
}
