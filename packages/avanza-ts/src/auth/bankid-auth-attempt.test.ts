import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationError } from '../errors.js';
import { httpFixtureResponse, jsonResponse } from '../test-utils/http.js';

const START = '/_api/authentication/v2/sessions/bankid';
const RESTART = `${START}/restart`;
const COLLECT = `${START}/collect`;
const CANCEL = `${START}/cancel`;
const INFO = '/_api/authentication/session/info/session';

describe('BankIdAuthAttempt', () => {
  it('starts, retains attempt cookies, and rotates a pending QR payload', async () => {
    const paths: string[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const path = new URL(input.toString()).pathname;
      paths.push(path);

      if (path === START) {
        expect(JSON.parse(String(init?.body))).toEqual({ method: 'QR_START', returnScheme: 'NOP' });
        return jsonResponse(started(), {
          headers: { 'Set-Cookie': 'attempt=one; Path=/; HttpOnly; Secure' },
        });
      }
      expect(new Headers(init?.headers).get('Cookie')).toBe('attempt=one');
      if (path === COLLECT) {
        return jsonResponse({ state: 'OUTSTANDING_TRANSACTION' });
      }
      return jsonResponse({ qrToken: 'qr-payload-2' });
    });
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    const attempt = await client.auth.startBankId();
    expect(attempt.challenge).toEqual({
      autostartToken: 'autostart token',
      autostartUrl: 'bankid:///?autostarttoken=autostart%20token&redirect=null',
      qrPayload: 'qr-payload-1',
      refreshAfterMs: 1500,
    });

    await expect(attempt.poll()).resolves.toEqual({
      challenge: { ...attempt.challenge, qrPayload: 'qr-payload-2' },
      status: 'pending',
    });
    expect(paths).toEqual([START, COLLECT, RESTART]);
  });

  it('starts when Avanza omits same-device autostart metadata', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
      const path = new URL(input.toString()).pathname;
      if (path === START) {
        return jsonResponse({
          qrToken: 'qr-payload-1',
          transactionId: 'transaction-id',
        });
      }
      expect(path).toBe(CANCEL);
      return new Response(null, { status: 204 });
    });
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    const attempt = await client.auth.startBankId();

    expect(attempt.challenge).toEqual({
      qrPayload: 'qr-payload-1',
      refreshAfterMs: 1500,
    });
    await attempt.cancel();
  });

  it('selects one customer, verifies the session, and installs it', async () => {
    let infoCalls = 0;
    const paths: string[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
      const path = new URL(input.toString()).pathname;
      paths.push(path);

      if (path === START) {
        return jsonResponse(started(), {
          headers: { 'Set-Cookie': 'session=authenticated; Path=/; HttpOnly; Secure' },
        });
      }
      if (path === COLLECT) {
        return jsonResponse({
          logins: [{ customerId: 'customer/id' }],
          state: 'COMPLETE',
        });
      }
      if (path === INFO) {
        infoCalls += 1;
        return jsonResponse(sessionInfo(infoCalls === 2));
      }
      expect(path).toBe(`${COLLECT}/customer%2Fid`);
      return new Response(null, { status: 204 });
    });
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    const attempt = await client.auth.startBankId();

    const result = await attempt.poll();

    expect(result.status).toBe('complete');
    expect(result.status === 'complete' ? result.session : undefined).toMatchObject({
      customerId: 'customer/id',
      mode: 'bankid',
      securityToken: 'security-token',
    });
    expect(client.session).toEqual(result.status === 'complete' ? result.session : undefined);
    expect(paths).toEqual([START, COLLECT, INFO, `${COLLECT}/customer%2Fid`, INFO]);
  });

  it('replays the recorded BankID response flow', async () => {
    let collectCalls = 0;
    let infoCalls = 0;
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
      const path = new URL(input.toString()).pathname;
      if (path === START) {
        return bankIdFixtureResponse('start', [
          'AZABANKIDTRANSID=attempt; Path=/; Secure; HttpOnly',
        ]);
      }
      if (path === COLLECT) {
        collectCalls += 1;
        return bankIdFixtureResponse(collectCalls === 1 ? 'collect-pending' : 'collect-complete');
      }
      if (path === RESTART) return bankIdFixtureResponse('restart');
      if (path === INFO) {
        infoCalls += 1;
        return bankIdFixtureResponse(
          infoCalls === 1 ? 'session-info-unverified' : 'session-info-verified',
        );
      }
      expect(path).toBe(`${COLLECT}/%3Ccustomer-id%3E`);
      return bankIdFixtureResponse('customer-selection', [
        'AZABANKIDTRANSID=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax',
        'csid=credential; Path=/; Secure; HttpOnly; SameSite=Strict',
      ]);
    });
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    const attempt = await client.auth.startBankId();

    await expect(attempt.poll()).resolves.toMatchObject({ status: 'pending' });
    const result = await attempt.poll();

    expect(result.status).toBe('complete');
    if (result.status !== 'complete') return;
    expect(result.session.customerId).toBe('<customer-id>');
    expect(result.session.cookies).toEqual([
      expect.objectContaining({ key: 'csid', value: 'credential' }),
    ]);
    expect(client.session).toEqual(result.session);
  });

  it.each([
    ['USER_CANCEL', 'denied'],
    ['CANCELLED', 'denied'],
    ['EXPIRED_TRANSACTION', 'expired'],
  ] as const)('maps %s to %s', async (state, expected) => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) =>
      jsonResponse(new URL(input.toString()).pathname === START ? started() : { state }),
    );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    const attempt = await client.auth.startBankId();

    await expect(attempt.poll()).resolves.toEqual({ status: expected });
    expect(client.session).toBeUndefined();
  });

  it('cancels remotely once and accepts an already missing attempt', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const path = new URL(input.toString()).pathname;
      if (path === START) {
        return jsonResponse(started());
      }
      expect(path).toBe(CANCEL);
      expect(JSON.parse(String(init?.body))).toEqual({ transactionId: 'transaction-id' });
      return jsonResponse({ message: 'missing' }, { status: 404 });
    });
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    const attempt = await client.auth.startBankId();

    await attempt.cancel();
    await attempt.cancel();

    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(attempt.poll()).rejects.toMatchObject<Partial<AvanzaAuthenticationError>>({
      code: 'cancelled',
    });
  });

  it('prevents an in-flight poll from installing a session after cancellation', async () => {
    let resolveCollect: ((response: Response) => void) | undefined;
    const collectResponse = new Promise<Response>((resolve) => {
      resolveCollect = resolve;
    });
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
      const path = new URL(input.toString()).pathname;
      if (path === START) {
        return jsonResponse(started(), { headers: { 'Set-Cookie': 'attempt=one; Path=/' } });
      }
      if (path === COLLECT) {
        return collectResponse;
      }
      expect(path).toBe(CANCEL);
      return new Response(null, { status: 204 });
    });
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    const attempt = await client.auth.startBankId();
    const polling = attempt.poll();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    await attempt.cancel();
    resolveCollect?.(jsonResponse({ state: 'COMPLETE' }));

    await expect(polling).rejects.toMatchObject<Partial<AvanzaAuthenticationError>>({
      code: 'cancelled',
    });
    expect(client.session).toBeUndefined();
  });

  it('rejects multiple-customer completion without installing a session', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
      const path = new URL(input.toString()).pathname;
      if (path === START) {
        return jsonResponse(started(), { headers: { 'Set-Cookie': 'attempt=one; Path=/' } });
      }
      if (path === COLLECT) {
        return jsonResponse({
          logins: [{ customerId: 'one' }, { customerId: 'two' }],
          state: 'COMPLETE',
        });
      }
      return jsonResponse(sessionInfo(false));
    });
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    const attempt = await client.auth.startBankId();

    await expect(attempt.poll()).rejects.toMatchObject<Partial<AvanzaAuthenticationError>>({
      code: 'customer_selection',
    });
    expect(client.session).toBeUndefined();
  });
});

function started() {
  return {
    autostartToken: 'autostart token',
    qrToken: 'qr-payload-1',
    transactionId: 'transaction-id',
  };
}

function sessionInfo(loggedIn: boolean) {
  return {
    isContextVerifiedWithBackend: loggedIn,
    user: {
      id: loggedIn ? 'user-id' : null,
      loggedIn,
      securityToken: loggedIn ? 'security-token' : '-',
    },
  };
}

function bankIdFixtureResponse(name: string, setCookies: readonly string[] = []): Response {
  return httpFixtureResponse(`auth/fixtures/bankid/${name}.json`, {
    setCookies,
  });
}
