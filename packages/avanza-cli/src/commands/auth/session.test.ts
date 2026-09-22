import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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
      getSessionInfo: async () => {
        if (this.options.fetch && this.options.fetch !== globalThis.fetch) {
          await this.options.fetch('https://example.test/_api/authentication/session/info/session');
        }
        return mocks.getSessionInfo();
      },
      validateSession: async () => {
        if (this.options.fetch && this.options.fetch !== globalThis.fetch) {
          await this.options.fetch('https://example.test/validation');
        }
        return mocks.validateSession();
      },
    };

    public session = {
      cookies: [{ key: 'session', value: 'refreshed-credential' }],
      mode: 'bankid',
    };

    public constructor(private readonly options: { fetch?: typeof globalThis.fetch } = {}) {}
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

  it('prints the full session-info JSON with only explicit fields redacted', async () => {
    const log = vi.spyOn(Session.prototype, 'log').mockImplementation(() => undefined);
    const info = {
      invalidSessionId: 'sensitive-id',
      user: {
        greetingName: 'Anna',
        id: 'customer-id',
        loggedIn: true,
        pushSubscriptionId: 'push-id',
        securityToken: 'secret-token',
      },
    };
    mocks.getSessionInfo.mockResolvedValue(info);

    await Session.run(['--json'], { root: packageRoot });

    expect(JSON.parse(log.mock.calls[0]![0]!)).toEqual({
      invalidSessionId: 'sensitive-id',
      user: {
        greetingName: 'Anna',
        id: 'customer-id',
        loggedIn: true,
        pushSubscriptionId: 'push-id',
        securityToken: '<redacted>',
      },
    });
    expect(info.user.securityToken).toBe('secret-token');
  });

  it('prints only the final raw HTTP exchange as a fixture', async () => {
    const log = vi.spyOn(Session.prototype, 'log').mockImplementation(() => undefined);
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (input) =>
        new Response(
          JSON.stringify({
            user: { securityToken: input.toString().includes('validation') ? 'old' : 'new' },
          }),
          { headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'private=value' } },
        ),
    );

    await Session.run(['--fixture'], { root: packageRoot });

    const fixture = JSON.parse(log.mock.calls[0]![0]!) as {
      request: { path: string };
      response: { body: { user: { securityToken: string } } };
    };
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fixture.request.path).toBe('/_api/authentication/session/info/session');
    expect(fixture.response.body.user.securityToken).toBe('new');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]![0]).not.toContain('private=value');
  });

  it('writes a raw fixture to a temporary file without printing it', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'avanza-fixture-'));
    const path = join(directory, 'capture.json');
    const log = vi.spyOn(Session.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"user":{"securityToken":"secret"}}', {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    try {
      await Session.run(['--fixture', '--output', path], { root: packageRoot });
      expect(JSON.parse(await readFile(path, 'utf8'))).toMatchObject({
        response: { body: { user: { securityToken: 'secret' } } },
      });
      expect(log).not.toHaveBeenCalled();
      await expect(
        Session.run(['--fixture', '--output', path], { root: packageRoot }),
      ).rejects.toThrow();
      expect(JSON.parse(await readFile(path, 'utf8'))).toMatchObject({
        response: { body: { user: { securityToken: 'secret' } } },
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('rejects conflicting output flags and an output path without fixture mode', async () => {
    await expect(Session.run(['--json', '--fixture'], { root: packageRoot })).rejects.toThrow();
    await expect(
      Session.run(['--output', 'capture.json'], { root: packageRoot }),
    ).rejects.toThrow();
  });

  it('does not print a fixture without a valid session', async () => {
    mocks.loadSession.mockResolvedValue(undefined);
    const log = vi.spyOn(Session.prototype, 'log').mockImplementation(() => undefined);
    await expect(Session.run(['--fixture'], { root: packageRoot })).rejects.toThrow(
      'No JSON HTTP response was captured',
    );
    expect(log).not.toHaveBeenCalled();
  });
});
