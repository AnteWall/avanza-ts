import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { expectFixtureReplay, jsonResponse } from '../test-utils/http.js';

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

  it('posts time period, custom range, total value, and insights queries', async () => {
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
      [
        () => client.performance.insights('THIS_YEAR', ['a']),
        '/_api/insights-development/insights',
        { timePeriod: 'THIS_YEAR', accountIds: ['a'] },
      ],
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

describe('PerformanceClient portfolio analytics', () => {
  it('sends key ratio, comparison, and yearly summary queries', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => jsonResponse({}));
    const { performance } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });
    const range = { from: '2025-01-01', to: '2025-12-31' };
    const year = { scrambledAccountIds: ['a'], year: 2025 };
    const calls = [
      [
        () => performance.keyRatios({ accountIds: ['a'], includeClosedAccounts: true }),
        'POST /_api/account-performance/overview/keyratios?includeClosedAccounts=true',
        ['a'],
      ],
      [() => performance.keyRatios(), 'POST /_api/account-performance/overview/keyratios', []],
      [
        () => performance.keyRatioHistory({ fromDate: '2025-01-01' }),
        'POST /_api/account-performance/overview/keyratios/history',
        { accountIds: [], includeClosedAccounts: false, fromDate: '2025-01-01' },
      ],
      [
        () => performance.averageCustomerChart(range),
        'POST /_api/account-performance-analysis/avanza/average',
        range,
      ],
      [
        () => performance.orderbookCharts(['5269'], range),
        'POST /_api/account-performance-analysis/chart/orderbook',
        { orderbookIds: ['5269'], fromDate: '2025-01-01', toDate: '2025-12-31' },
      ],
      [
        () => performance.yearSummary(2025, ['a']),
        'POST /_api/yearly-summary/development/performance',
        year,
      ],
      [
        () => performance.yearTransactions(2025, ['a']),
        'POST /_api/yearly-summary/transactions',
        year,
      ],
      [
        () => performance.yearChart(2025, 'relative-from-start', ['a']),
        'POST /_api/yearly-summary/chart/relative-from-start',
        year,
      ],
      [
        () => performance.yearBenchmark(2025, 'usa'),
        'GET /_api/yearly-summary/chart/benchmark/usa?year=2025',
        undefined,
      ],
    ] as const;
    await Promise.all(calls.map(([call]) => call()));
    expect(
      fetch.mock.calls.map(([url, init]) => {
        const { pathname, search } = new URL(url.toString());
        return [
          `${init?.method} ${pathname}${search}`,
          init?.body === undefined ? undefined : (JSON.parse(String(init.body)) as unknown),
        ];
      }),
    ).toEqual(expect.arrayContaining(calls.map(([, request, sent]) => [request, sent])));
    expect(fetch).toHaveBeenCalledTimes(calls.length);
    expect(() => performance.orderbookCharts([], range)).toThrow(TypeError);
  });

  it('resolves omitted account IDs to every account before yearly and fund queries', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async (url) =>
        jsonResponse(
          url.toString().endsWith('/yearly-summary/accounts')
            ? { scrambledAccountIds: [{ id: 1 }, { id: 2 }] }
            : {},
        ),
      );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });

    await client.performance.yearSummary(2025);
    await client.positions.fundAnalysis();

    expect(
      fetch.mock.calls.map(([url, init]) => [
        new URL(url.toString()).pathname,
        init?.body === undefined ? undefined : (JSON.parse(String(init.body)) as unknown),
      ]),
    ).toEqual([
      ['/_api/yearly-summary/accounts', undefined],
      [
        '/_api/yearly-summary/development/performance',
        { scrambledAccountIds: ['1', '2'], year: 2025 },
      ],
      ['/_api/yearly-summary/accounts', undefined],
      ['/_api/portfolio-analysis/analyze', ['1', '2']],
    ]);
  });

  it('replays a recorded benchmark response', () =>
    expectFixtureReplay('performance/fixtures/year-benchmark.json', (c) =>
      c.performance.yearBenchmark(2025, 'omx'),
    ));
});
