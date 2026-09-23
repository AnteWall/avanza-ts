import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { jsonResponse } from '../test-utils/http.js';

describe('AccountsClient read-only endpoints', () => {
  it('requires a session before requesting account data', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    await expect(client.accounts.list()).rejects.toBeInstanceOf(AvanzaAuthenticationRequiredError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends only GET requests to the account and balance endpoints', async () => {
    const body = { accounts: [{ id: 'synthetic-account' }] };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async () => jsonResponse(body));
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        mode: 'totp',
        authenticationSession: 'session',
        securityToken: 'token',
      },
    });
    const calls = [
      [() => client.accounts.list(), '/_api/account-overview/accounts/list'],
      [() => client.accounts.closed(), '/_api/account-overview/accounts/closed'],
      [() => client.accounts.hasClosed(), '/_api/account-overview/accounts/has-closed'],
      [() => client.accounts.categories(), '/_api/account-overview/accounts/categories'],
      [() => client.accounts.overview('a/b'), '/_api/account-overview/overview/account/a%2Fb'],
      [
        () => client.accounts.categorizedOverview(),
        '/_api/account-overview/overview/categorizedAccounts',
      ],
      [() => client.accounts.tradingAccounts(), '/_api/trading-critical/rest/accounts'],
      [
        () => client.accounts.accountsAndPositions(),
        '/_api/trading-critical/rest/accountsandpositions',
      ],
      [
        () => client.accounts.lightweightAccounts(),
        '/_api/trading-critical/rest/lightweightaccounts',
      ],
    ] as const;
    expect(await Promise.all(calls.map(([call]) => call()))).toEqual(calls.map(() => body));
    expect(
      fetch.mock.calls.map(([url, init]) => [new URL(url.toString()).pathname, init?.method]),
    ).toEqual(calls.map(([, path]) => [path, 'GET']));
    expect(fetch.mock.calls.every(([, init]) => init?.body === undefined)).toBe(true);
    expect(new Headers(fetch.mock.calls[0]![1]?.headers).get('X-AuthenticationSession')).toBe(
      'session',
    );
    expect(() => client.accounts.overview('')).toThrow();
    expect(fetch).toHaveBeenCalledTimes(calls.length);
  });
});
