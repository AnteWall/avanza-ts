import { describe, expect, it, vi } from 'vitest';

import type { AvanzaSession } from '../auth/session.js';
import { AvanzaAuthenticationRequiredError, AvanzaHttpError } from '../errors.js';
import { HttpClient } from './http-client.js';
import type { AccessMode } from './http-types.js';

const session: AvanzaSession = {
  authenticationSession: 'authentication-session',
  customerId: 'customer-id',
  pushSubscriptionId: 'push-subscription-id',
  securityToken: 'security-token',
};

describe('HttpClient access policy', () => {
  it.each<[AccessMode, boolean]>([
    ['public', false],
    ['public', true],
    ['optional', false],
    ['optional', true],
    ['required', false],
    ['required', true],
  ])('handles %s access with session=%s', async (access, hasSession) => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValue(jsonResponse({ ok: true }));
    const client = new HttpClient({
      fetch,
      getSession: () => (hasSession ? session : undefined),
    });
    const request = client.request({ access, method: 'GET', path: '/resource' });

    if (access === 'required' && !hasSession) {
      await expect(request).rejects.toBeInstanceOf(AvanzaAuthenticationRequiredError);
      expect(fetch).not.toHaveBeenCalled();
      return;
    }

    await expect(request).resolves.toEqual({ ok: true });
    const [, init] = fetch.mock.calls[0]!;
    const headers = new Headers(init?.headers);

    expect(headers.get('X-AuthenticationSession')).toBe(
      hasSession ? session.authenticationSession : null,
    );
    expect(headers.get('X-SecurityToken')).toBe(hasSession ? session.securityToken : null);
  });

  it('reads session state for every request and protects its headers', async () => {
    let activeSession: AvanzaSession | undefined;
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    fetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    fetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = new HttpClient({ fetch, getSession: () => activeSession });

    await client.request({ access: 'public', method: 'GET', path: '/resource' });
    activeSession = session;
    await client.request({
      access: 'optional',
      headers: {
        'X-AuthenticationSession': 'endpoint-value',
        'X-SecurityToken': 'endpoint-value',
      },
      method: 'GET',
      path: '/resource',
    });
    activeSession = undefined;
    await client.request({ access: 'optional', method: 'GET', path: '/resource' });

    const firstHeaders = new Headers(fetch.mock.calls[0]![1]?.headers);
    const secondHeaders = new Headers(fetch.mock.calls[1]![1]?.headers);
    const thirdHeaders = new Headers(fetch.mock.calls[2]![1]?.headers);

    expect(firstHeaders.has('X-AuthenticationSession')).toBe(false);
    expect(secondHeaders.get('X-AuthenticationSession')).toBe(session.authenticationSession);
    expect(secondHeaders.get('X-SecurityToken')).toBe(session.securityToken);
    expect(thirdHeaders.has('X-AuthenticationSession')).toBe(false);
  });
});

describe('HttpClient requests', () => {
  it('builds URLs and serializes JSON requests', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValue(jsonResponse({ id: 'order-id' }));
    const signal = AbortSignal.abort();
    const client = new HttpClient({
      baseUrl: 'https://example.test/api',
      fetch,
      getSession: () => undefined,
    });

    await expect(
      client.request({
        access: 'public',
        body: { price: 100, volume: 2 },
        method: 'POST',
        path: '/orders?existing=yes',
        query: {
          empty: undefined,
          enabled: true,
          ids: ['1', '2'],
          limit: 10,
        },
        signal,
      }),
    ).resolves.toEqual({ id: 'order-id' });

    const [input, init] = fetch.mock.calls[0]!;
    const url = new URL(input.toString());
    const headers = new Headers(init?.headers);

    expect(url.toString()).toBe(
      'https://example.test/api/orders?existing=yes&enabled=true&ids=1&ids=2&limit=10',
    );
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"price":100,"volume":2}');
    expect(init?.signal).toBe(signal);
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('returns text and empty responses', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValueOnce(new Response('plain text'));
    fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = new HttpClient({ fetch, getSession: () => undefined });

    await expect(client.request({ access: 'public', method: 'GET', path: '/text' })).resolves.toBe(
      'plain text',
    );
    await expect(
      client.request({ access: 'public', method: 'GET', path: '/empty' }),
    ).resolves.toBeUndefined();
  });

  it('throws structured errors for unsuccessful responses', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    fetch.mockResolvedValue(
      jsonResponse(
        { message: 'Unauthorized' },
        { headers: { 'X-Request-Id': 'request-id' }, status: 401, statusText: 'Unauthorized' },
      ),
    );
    const client = new HttpClient({ fetch, getSession: () => session });

    const request = client.request({ access: 'required', method: 'GET', path: '/private' });

    await expect(request).rejects.toMatchObject<Partial<AvanzaHttpError>>({
      body: { message: 'Unauthorized' },
      headers: expect.objectContaining({ 'x-request-id': 'request-id' }),
      status: 401,
      statusText: 'Unauthorized',
    });
  });
});

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify(body), { ...init, headers });
}
