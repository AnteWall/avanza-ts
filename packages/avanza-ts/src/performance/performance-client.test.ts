import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { jsonResponse } from '../test-utils/http.js';

const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' } as const;

describe('PerformanceClient query endpoints', () => {
  it('requires a session before requesting performance data', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    await expect(client.performance.totalValues()).rejects.toBeInstanceOf(
      AvanzaAuthenticationRequiredError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('posts time period, custom range, and total value queries', async () => {
    const body = { accounts: [] };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async () => jsonResponse(body));
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });
    const base = '/_api/account-performance/overview';
    const calls = [
      [
        () => client.performance.chart('ONE_YEAR', { accountIds: ['a'] }),
        `${base}/chart/accounts/timeperiod`,
        { timePeriod: 'ONE_YEAR', scrambledAccountIds: ['a'], includeClosedAccounts: false },
      ],
      [
        () =>
          client.performance.chart(
            { from: '2025-01-01', to: '2025-02-01' },
            { includeClosedAccounts: true },
          ),
        `${base}/chart/accounts/timeperiod_custom`,
        {
          from: '2025-01-01',
          to: '2025-02-01',
          scrambledAccountIds: [],
          includeClosedAccounts: true,
        },
      ],
      [() => client.performance.totalValues(['a', 'b']), `${base}/total-values`, ['a', 'b']],
      [() => client.performance.totalValues(), `${base}/total-values`, []],
    ] as const;
    expect(await Promise.all(calls.map(([call]) => call()))).toEqual(calls.map(() => body));
    expect(
      fetch.mock.calls.map(([url, init]) => [
        new URL(url.toString()).pathname,
        init?.method,
        JSON.parse(String(init?.body)) as unknown,
      ]),
    ).toEqual(calls.map(([, path, sent]) => [path, 'POST', sent]));
    expect(() => client.performance.totalValues([' '])).toThrow(TypeError);
    expect(fetch).toHaveBeenCalledTimes(calls.length);
  });
});
