import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { jsonResponse } from '../test-utils/http.js';

const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' } as const;

describe('TransactionsClient read-only endpoints', () => {
  it('requires a session before requesting transactions', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    await expect(client.transactions.list()).rejects.toBeInstanceOf(
      AvanzaAuthenticationRequiredError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends only GET requests with encoded IDs and filters', async () => {
    const body = { transactions: [] };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async () => jsonResponse(body));
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });
    const calls = [
      [() => client.transactions.list(), '/_api/transactions/list'],
      [
        () =>
          client.transactions.list({
            from: '2025-01-01',
            to: '2025-02-01',
            accountIds: ['a', 'b'],
            transactionTypes: ['BUY'],
            includeCancelled: true,
          }),
        '/_api/transactions/list?from=2025-01-01&to=2025-02-01&accountIds=a&accountIds=b&transactionTypes=BUY&includeCancelled=true',
      ],
      [() => client.transactions.pending(), '/_api/transactions/pending'],
      [() => client.transactions.transaction('a/b', '1'), '/_api/transactions/transaction/a%2Fb/1'],
      [() => client.transactions.dividends(), '/_api/transactions/dividends'],
      [
        () => client.transactions.dividends({ accountId: 'a', includeClosedAccounts: true }),
        '/_api/transactions/dividends/a?includeClosedAccounts=true',
      ],
    ] as const;
    expect(await Promise.all(calls.map(([call]) => call()))).toEqual(calls.map(() => body));
    expect(
      fetch.mock.calls.map(([url, init]) => {
        const { pathname, search } = new URL(url.toString());
        return [pathname + search, init?.method, init?.body];
      }),
    ).toEqual(calls.map(([, path]) => [path, 'GET', undefined]));
    expect(() => client.transactions.transaction('a', '')).toThrow(TypeError);
    expect(fetch).toHaveBeenCalledTimes(calls.length);
  });
});
