import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  loginWithTotp: vi.fn(),
  password: vi.fn(),
  saveSession: vi.fn(),
  text: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
  cancel: mocks.cancel,
  isCancel: mocks.isCancel,
  password: mocks.password,
  text: mocks.text,
}));

vi.mock('avanza-ts', () => ({
  AvanzaClient: class {
    public auth = { loginWithTotp: mocks.loginWithTotp };
  },
}));

vi.mock('../../services/session/session-store.js', () => ({ saveSession: mocks.saveSession }));

import Totp from './totp.js';

const originalEnvironment = { ...process.env };
const packageRoot = resolve(import.meta.dirname, '../../..');

describe('auth totp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AVANZA_PASSWORD;
    delete process.env.AVANZA_TOTP_CODE;
    delete process.env.AVANZA_TOTP_SECRET;
    delete process.env.AVANZA_USERNAME;
    mocks.loginWithTotp.mockResolvedValue({
      authenticationSession: 'authentication-session',
      mode: 'totp',
      securityToken: 'security-token',
    });
    mocks.saveSession.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
    delete (process.stdin as unknown as { isTTY?: boolean }).isTTY;
    vi.restoreAllMocks();
  });

  it('uses environment credentials without prompting', async () => {
    process.env.AVANZA_USERNAME = 'user';
    process.env.AVANZA_PASSWORD = 'password';
    process.env.AVANZA_TOTP_SECRET = 'JBSWY3DPEHPK3PXP';

    await Totp.run([], { root: packageRoot });

    expect(mocks.loginWithTotp).toHaveBeenCalledWith({
      password: 'password',
      retryWithNextCode: true,
      totpSecret: 'JBSWY3DPEHPK3PXP',
      username: 'user',
    });
    expect(mocks.password).not.toHaveBeenCalled();
    expect(mocks.text).not.toHaveBeenCalled();
    expect(mocks.saveSession).toHaveBeenCalledWith(expect.objectContaining({ mode: 'totp' }));
  });

  it('prompts for missing credentials in an interactive terminal', async () => {
    setTty(true);
    mocks.text.mockResolvedValue('prompt-user');
    mocks.password.mockResolvedValueOnce('prompt-password').mockResolvedValueOnce('123456');

    await Totp.run([], { root: packageRoot });

    expect(mocks.loginWithTotp).toHaveBeenCalledWith({
      password: 'prompt-password',
      totpCode: '123456',
      username: 'prompt-user',
    });
  });

  it('rejects conflicting TOTP environment values', async () => {
    process.env.AVANZA_TOTP_CODE = '123456';
    process.env.AVANZA_TOTP_SECRET = 'JBSWY3DPEHPK3PXP';

    await expect(Totp.run([], { root: packageRoot })).rejects.toThrow(
      'Set only one of AVANZA_TOTP_SECRET and AVANZA_TOTP_CODE.',
    );
    expect(mocks.loginWithTotp).not.toHaveBeenCalled();
  });

  it('does not prompt without an interactive terminal', async () => {
    setTty(false);

    await expect(Totp.run([], { root: packageRoot })).rejects.toThrow('Missing AVANZA_USERNAME');
    expect(mocks.text).not.toHaveBeenCalled();
  });
});

function setTty(isTTY: boolean): void {
  Object.defineProperty(process.stdin, 'isTTY', { configurable: true, value: isTTY });
}
