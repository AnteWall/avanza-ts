import { beforeEach, describe, expect, it, vi } from 'vitest';

const keyring = vi.hoisted(() => ({
  construct: vi.fn(),
  deletePassword: vi.fn(),
  getPassword: vi.fn(),
  setPassword: vi.fn(),
}));

vi.mock('@napi-rs/keyring', () => ({
  AsyncEntry: class {
    public constructor(...arguments_: unknown[]) {
      keyring.construct(...arguments_);
    }

    public deletePassword = keyring.deletePassword;
    public getPassword = keyring.getPassword;
    public setPassword = keyring.setPassword;
  },
}));

import { deleteSession, loadSession, saveSession } from './session-store.js';

describe('session store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a TOTP session', async () => {
    keyring.getPassword.mockResolvedValue(
      JSON.stringify({
        authenticationSession: 'authentication-session',
        customerId: 'customer',
        mode: 'totp',
        securityToken: 'security-token',
      }),
    );

    await expect(loadSession()).resolves.toEqual({
      authenticationSession: 'authentication-session',
      customerId: 'customer',
      mode: 'totp',
      securityToken: 'security-token',
    });
    expect(keyring.construct).toHaveBeenCalledWith(
      'avanza-cli',
      'session',
      process.platform === 'linux' ? { linux: { store: 'secret-service' } } : undefined,
    );
  });

  it('loads a BankID session with cookies', async () => {
    keyring.getPassword.mockResolvedValue(
      JSON.stringify({
        cookies: [{ httpOnly: true, key: 'session', path: '/', value: 'credential' }],
        mode: 'bankid',
      }),
    );

    await expect(loadSession()).resolves.toEqual({
      cookies: [{ httpOnly: true, key: 'session', path: '/', value: 'credential' }],
      mode: 'bankid',
    });
  });

  it('preserves the SDK cookie snapshot without duplicating its schema', async () => {
    keyring.getPassword.mockResolvedValue(
      JSON.stringify({
        cookies: [
          {
            creation: null,
            domain: null,
            expires: null,
            extensions: null,
            hostOnly: null,
            key: 'session',
            lastAccessed: null,
            maxAge: null,
            path: null,
            pathIsDefault: null,
            value: '',
          },
        ],
        mode: 'bankid',
      }),
    );

    await expect(loadSession()).resolves.toEqual({
      cookies: [
        {
          creation: null,
          domain: null,
          expires: null,
          extensions: null,
          hostOnly: null,
          key: 'session',
          lastAccessed: null,
          maxAge: null,
          path: null,
          pathIsDefault: null,
          value: '',
        },
      ],
      mode: 'bankid',
    });
  });

  it.each([undefined, null])('returns undefined when the credential is %s', async (credential) => {
    keyring.getPassword.mockResolvedValue(credential);
    await expect(loadSession()).resolves.toBeUndefined();
  });

  it.each(['not json', '{}', '{"mode":"totp"}', '{"cookies":[],"mode":"other"}'])(
    'rejects malformed stored data: %s',
    async (serialized) => {
      keyring.getPassword.mockResolvedValue(serialized);
      await expect(loadSession()).rejects.toThrow('stored in the OS credential store is invalid');
    },
  );

  it('saves and deletes credentials', async () => {
    keyring.setPassword.mockResolvedValue(undefined);
    keyring.deletePassword.mockResolvedValue(true);
    const session = {
      authenticationSession: 'authentication-session',
      mode: 'totp' as const,
      securityToken: 'security-token',
    };

    await saveSession(session);
    await expect(deleteSession()).resolves.toBe(true);

    expect(keyring.setPassword).toHaveBeenCalledWith(JSON.stringify(session));
    expect(keyring.deletePassword).toHaveBeenCalledOnce();
  });
});
