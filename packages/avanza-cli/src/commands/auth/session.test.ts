import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteSession: vi.fn(),
  getSessionInfo: vi.fn(),
  loadSession: vi.fn(),
  saveSession: vi.fn(),
  validateSession: vi.fn(),
}));

vi.mock('avanza-ts', () => ({
  AvanzaClient: class {
    public auth = {
      getSessionInfo: mocks.getSessionInfo,
      validateSession: mocks.validateSession,
    };

    public session = {
      cookies: [{ key: 'session', value: 'refreshed-credential' }],
      mode: 'bankid',
    };
  },
}));

vi.mock('../../services/session/session-store.js', () => {
  class InvalidStoredSessionError extends Error {}
  return {
    deleteSession: mocks.deleteSession,
    InvalidStoredSessionError,
    loadSession: mocks.loadSession,
    saveSession: mocks.saveSession,
  };
});

import { InvalidStoredSessionError } from '../../services/session/session-store.js';
import Session from './session.js';

const packageRoot = resolve(import.meta.dirname, '../../..');
const storedSession = {
  cookies: [{ key: 'session', value: 'stored-credential' }],
  mode: 'bankid',
};

describe('auth session', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    mocks.deleteSession.mockResolvedValue(true);
    mocks.getSessionInfo.mockResolvedValue({ user: { greetingName: 'Anna' } });
    mocks.loadSession.mockResolvedValue(storedSession);
    mocks.saveSession.mockResolvedValue(undefined);
    mocks.validateSession.mockResolvedValue(true);
  });

  it('validates, refreshes, and reports a redacted session', async () => {
    const log = vi.spyOn(Session.prototype, 'log').mockImplementation(() => undefined);

    await Session.run([], { root: packageRoot });

    expect(mocks.saveSession).toHaveBeenCalledWith({
      cookies: [{ key: 'session', value: 'refreshed-credential' }],
      mode: 'bankid',
    });
    const output = log.mock.calls.flat().join('');
    expect(output).toContain('Signed in');
    expect(output).toContain('Method: BankID');
    expect(output).toContain('User: Anna');
    expect(output).not.toContain('stored-credential');
    expect(output).not.toContain('refreshed-credential');
  });

  it('reports a missing session', async () => {
    mocks.loadSession.mockResolvedValue(undefined);

    await Session.run([], { root: packageRoot });
    expect(mocks.validateSession).not.toHaveBeenCalled();
  });

  it('deletes an expired session', async () => {
    mocks.validateSession.mockResolvedValue(false);

    await Session.run([], { root: packageRoot });
    expect(mocks.deleteSession).toHaveBeenCalledOnce();
    expect(mocks.saveSession).not.toHaveBeenCalled();
  });

  it('deletes malformed stored data', async () => {
    mocks.loadSession.mockRejectedValue(new InvalidStoredSessionError('invalid'));

    await Session.run([], { root: packageRoot });
    expect(mocks.deleteSession).toHaveBeenCalledOnce();
  });

  it('keeps the stored session after a network failure', async () => {
    mocks.validateSession.mockRejectedValue(new Error('network failure'));

    await expect(Session.run([], { root: packageRoot })).rejects.toThrow('network failure');
    expect(mocks.deleteSession).not.toHaveBeenCalled();
  });
});
