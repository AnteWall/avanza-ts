import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateTotpCode } from './totp.js';

const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

afterEach(() => {
  vi.useRealTimers();
});

describe('generateTotpCode', () => {
  it.each([
    [59, '287082'],
    [1_111_111_109, '081804'],
    [1_111_111_111, '050471'],
    [1_234_567_890, '005924'],
    [2_000_000_000, '279037'],
    [20_000_000_000, '353130'],
  ])('matches the RFC 6238 SHA-1 vector at %i seconds', (seconds, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(seconds * 1000);
    expect(generateTotpCode(RFC_SECRET)).toBe(expected);
  });

  it('normalizes separators, whitespace, case, and padding', () => {
    expect(generateTotpCode('gezd-gnbv gy3tqojq====')).toBe(generateTotpCode('GEZD GNBVGY3TQOJQ'));
  });

  it.each(['', '%%%%', 'A'] as const)('rejects invalid secrets without echoing %j', (secret) => {
    expect(() => generateTotpCode(secret)).toThrow('TOTP secret');

    try {
      generateTotpCode(secret);
    } catch (error) {
      expect(String(error)).not.toContain('%%%%');
    }
  });
});
