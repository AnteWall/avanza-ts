import { createHmac } from 'node:crypto';

export function generateTotpCode(secret: string): string {
  const counter = BigInt(Math.floor(Date.now() / 30_000));
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(counter);
  const digest = createHmac('sha1', decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary = digest.readUInt32BE(offset) & 0x7fff_ffff;
  return String(binary % 1_000_000).padStart(6, '0');
}

function decodeBase32(secret: string): Buffer {
  const normalized = secret.replace(/[\s-]/g, '').replace(/=+$/, '').toUpperCase();

  if (normalized.length === 0 || /[^A-Z2-7]/.test(normalized)) {
    throw new TypeError('TOTP secret must be a non-empty base32 string.');
  }

  const bytes: number[] = [];
  let bits = 0;
  let buffer = 0;

  for (const character of normalized) {
    const code = character.charCodeAt(0);
    const value = code >= 65 && code <= 90 ? code - 65 : code - 50 + 26;
    buffer = (buffer << 5) | value;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 0xff);
      buffer &= (1 << bits) - 1;
    }
  }

  if (bytes.length === 0) {
    throw new TypeError('TOTP secret does not contain enough base32 data.');
  }

  return Buffer.from(bytes);
}
