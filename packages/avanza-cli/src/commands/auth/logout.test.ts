import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteSession: vi.fn(),
  loadSession: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('avanza-ts', () => ({
  AvanzaClient: class {
    public auth = { logout: mocks.logout };
  },
}));

vi.mock('../../services/session/session-store.js', () => {
  class InvalidStoredSessionError extends Error {}
  return {
    deleteSession: mocks.deleteSession,
    InvalidStoredSessionError,
    loadSession: mocks.loadSession,
  };
});

import { InvalidStoredSessionError } from '../../services/session/session-store.js';
import Logout from './logout.js';

const packageRoot = resolve(import.meta.dirname, '../../..');

describe('auth logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteSession.mockResolvedValue(true);
    mocks.loadSession.mockResolvedValue({
      authenticationSession: 'authentication-session',
      mode: 'totp',
      securityToken: 'security-token',
    });
    mocks.logout.mockResolvedValue(undefined);
  });

  it('logs out remotely and deletes the local session', async () => {
    await Logout.run([], { root: packageRoot });

    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.deleteSession).toHaveBeenCalledOnce();
  });

  it('succeeds when already signed out', async () => {
    mocks.loadSession.mockResolvedValue(undefined);

    await Logout.run([], { root: packageRoot });

    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.deleteSession).not.toHaveBeenCalled();
  });

  it('deletes malformed local session data', async () => {
    mocks.loadSession.mockRejectedValue(new InvalidStoredSessionError('invalid'));

    await Logout.run([], { root: packageRoot });

    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.deleteSession).toHaveBeenCalledOnce();
  });

  it('deletes locally and reports a remote logout failure', async () => {
    mocks.logout.mockRejectedValue(new Error('network failure'));

    await expect(Logout.run([], { root: packageRoot })).rejects.toThrow(
      'Local session removed, but the Avanza logout request failed.',
    );
    expect(mocks.deleteSession).toHaveBeenCalledOnce();
  });
});
