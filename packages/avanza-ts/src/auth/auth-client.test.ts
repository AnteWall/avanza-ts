import { afterEach, describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationError } from '../errors.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('AuthClient session info', () => {
  it('uses the installed session when available', async () => {
    const body = {
      invalidSessionId: '-',
      user: {
        company: false,
        customerGroup: '-',
        greetingName: '-',
        id: '-',
        loggedIn: false,
        minor: false,
        pushBaseUrl: 'https://push.avanza.se',
        pushSubscriptionId: '-',
        securityToken: '-',
        start: false,
      },
    };
    const authenticatedBody = {
      ...body,
      user: {
        ...body.user,
        customerGroup: 'PLATINA',
        greetingName: 'Authenticated user',
        id: 'customer-id',
        loggedIn: true,
        pushSubscriptionId: '',
        securityToken: 'security-token',
      },
    };
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValueOnce(jsonResponse(body));
    fetch.mockResolvedValueOnce(jsonResponse(authenticatedBody));

    const anonymous = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    await expect(anonymous.auth.getSessionInfo()).resolves.toEqual(body);

    const authenticated = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        authenticationSession: 'authentication-session',
        mode: 'totp',
        securityToken: 'security-token',
      },
    });
    await expect(authenticated.auth.getSessionInfo()).resolves.toEqual(authenticatedBody);

    expect(new Headers(fetch.mock.calls[0]![1]?.headers).has('X-AuthenticationSession')).toBe(
      false,
    );
    expect(new Headers(fetch.mock.calls[1]![1]?.headers).get('X-AuthenticationSession')).toBe(
      'authentication-session',
    );
    expect(fetch.mock.calls.map(([input]) => new URL(input.toString()).pathname)).toEqual([
      '/_api/authentication/session/info/session',
      '/_api/authentication/session/info/session',
    ]);
  });
});

describe('AuthClient TOTP login', () => {
  it('completes a two-step login with a supplied code', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValueOnce(
      jsonResponse({ twoFactorLogin: { method: 'TOTP', transactionId: 'transaction-id' } }),
    );
    fetch.mockResolvedValueOnce(
      jsonResponse(loginBody(), { headers: { 'X-SecurityToken': 'security-token' } }),
    );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    const session = await client.auth.loginWithTotp({
      password: 'password',
      totpCode: '123456',
      username: 'username',
    });

    expect(session).toEqual({
      authenticationSession: 'authentication-session',
      customerId: 'customer-id',
      mode: 'totp',
      pushSubscriptionId: 'push-subscription-id',
      securityToken: 'security-token',
    });
    expect(client.session).toBe(session);
    expect(JSON.parse(String(fetch.mock.calls[0]![1]?.body))).toEqual({
      maxInactiveMinutes: 1440,
      password: 'password',
      username: 'username',
    });
    const secondHeaders = new Headers(fetch.mock.calls[1]![1]?.headers);
    expect(secondHeaders.get('Cookie')).toBe('AZAMFATRANSACTION=transaction-id');
    expect(JSON.parse(String(fetch.mock.calls[1]![1]?.body))).toEqual({
      method: 'TOTP',
      totpCode: '123456',
    });
  });

  it('generates a code from a secret', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(59_000);
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValueOnce(
      jsonResponse({ twoFactorLogin: { method: 'TOTP', transactionId: 'transaction-id' } }),
    );
    fetch.mockResolvedValueOnce(
      jsonResponse(loginBody(), { headers: { 'X-SecurityToken': 'security-token' } }),
    );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    await client.auth.loginWithTotp({
      password: 'password',
      totpSecret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
      username: 'username',
    });

    expect(JSON.parse(String(fetch.mock.calls[1]![1]?.body))).toMatchObject({
      totpCode: '287082',
    });
  });

  it('optionally retries with the next generated code after a 401', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(59_000);
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValueOnce(
      jsonResponse({ twoFactorLogin: { method: 'TOTP', transactionId: 'first-transaction' } }),
    );
    fetch.mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, { status: 401 }));
    fetch.mockResolvedValueOnce(
      jsonResponse({ twoFactorLogin: { method: 'TOTP', transactionId: 'second-transaction' } }),
    );
    fetch.mockResolvedValueOnce(
      jsonResponse(loginBody(), { headers: { 'X-SecurityToken': 'security-token' } }),
    );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    const login = client.auth.loginWithTotp({
      password: 'password',
      retryWithNextCode: true,
      totpSecret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
      username: 'username',
    });
    await vi.runAllTimersAsync();
    await login;

    expect(fetch).toHaveBeenCalledTimes(4);
    const firstCode = JSON.parse(String(fetch.mock.calls[1]![1]?.body)).totpCode;
    const secondCode = JSON.parse(String(fetch.mock.calls[3]![1]?.body)).totpCode;
    expect(firstCode).not.toBe(secondCode);
  });

  it('supports a successful login without a second factor response', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValue(
      jsonResponse(
        { successfulLogin: loginBody() },
        { headers: { 'X-SecurityToken': 'security-token' } },
      ),
    );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    await expect(
      client.auth.loginWithTotp({
        password: 'password',
        totpCode: '123456',
        username: 'username',
      }),
    ).resolves.toMatchObject({ authenticationSession: 'authentication-session' });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('does not send an existing session while logging in', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValue(
      jsonResponse(
        { successfulLogin: loginBody() },
        { headers: { 'X-SecurityToken': 'new-token' } },
      ),
    );
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        authenticationSession: 'old-session',
        mode: 'totp',
        securityToken: 'old-token',
      },
    });

    await client.auth.loginWithTotp({
      password: 'password',
      totpCode: '123456',
      username: 'username',
    });

    const headers = new Headers(fetch.mock.calls[0]![1]?.headers);
    expect(headers.has('X-AuthenticationSession')).toBe(false);
    expect(headers.has('X-SecurityToken')).toBe(false);
  });

  it('returns a safe typed error for unsupported methods', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValue(
      jsonResponse({ twoFactorLogin: { method: 'SMS', transactionId: 'transaction-id' } }),
    );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    const request = client.auth.loginWithTotp({
      password: 'secret-password',
      totpCode: '123456',
      username: 'secret-user',
    });

    await expect(request).rejects.toMatchObject<Partial<AvanzaAuthenticationError>>({
      code: 'unsupported_method',
    });
    await expect(request).rejects.not.toThrow(/secret-password|secret-user|123456/);
  });
});

describe('AuthClient session lifecycle', () => {
  it('validates and refreshes a persisted BankID session', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockImplementation(async (_input, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('Cookie')).toBe('session=saved');
      expect(headers.get('X-SecurityToken')).toBe('old-token');
      return jsonResponse(
        {
          isContextVerifiedWithBackend: true,
          user: { id: 'user-id', loggedIn: true, securityToken: 'new-token' },
        },
        { headers: { 'Set-Cookie': 'session=rotated; Path=/; HttpOnly; Secure' } },
      );
    });
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        cookies: [
          {
            domain: 'example.test',
            hostOnly: true,
            key: 'session',
            path: '/',
            secure: true,
            value: 'saved',
          },
        ],
        mode: 'bankid',
        securityToken: 'old-token',
      },
    });

    const valid = await client.auth.validateSession();

    expect(valid).toBe(true);
    expect(client.session).toMatchObject({ mode: 'bankid', securityToken: 'new-token' });
    expect(
      client.session?.mode === 'bankid' ? client.session.cookies.map((cookie) => cookie.value) : [],
    ).toEqual(['rotated']);
  });

  it('clears an invalid restored session', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, { status: 401 }));
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        authenticationSession: 'session',
        mode: 'totp',
        securityToken: 'token',
      },
    });

    await expect(client.auth.validateSession()).resolves.toBe(false);
    expect(client.session).toBeUndefined();
  });

  it('sends session material on logout and always clears local state', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockImplementation(async (_input, init) => {
      const headers = new Headers(init?.headers);
      expect(init?.method).toBe('DELETE');
      expect(headers.get('Cookie')).toBe('session=saved');
      expect(headers.get('X-SecurityToken')).toBe('token');
      return new Response(null, { status: 204 });
    });
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        cookies: [
          {
            domain: 'example.test',
            hostOnly: true,
            key: 'session',
            path: '/',
            secure: true,
            value: 'saved',
          },
        ],
        mode: 'bankid',
        securityToken: 'token',
      },
    });

    await client.auth.logout();

    expect(client.session).toBeUndefined();
  });

  it('clears local state when remote logout fails', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockRejectedValue(new TypeError('sensitive upstream detail'));
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        authenticationSession: 'session',
        mode: 'totp',
        securityToken: 'token',
      },
    });

    const logout = client.auth.logout();
    await expect(logout).rejects.toMatchObject<Partial<AvanzaAuthenticationError>>({
      code: 'network',
    });
    await expect(logout).rejects.not.toThrow('sensitive upstream detail');
    expect(client.session).toBeUndefined();
  });
});

function loginBody() {
  return {
    authenticationSession: 'authentication-session',
    customerId: 'customer-id',
    pushSubscriptionId: 'push-subscription-id',
  };
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { ...init, headers });
}
