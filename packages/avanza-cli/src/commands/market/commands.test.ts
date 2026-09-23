import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loadSession: vi.fn(), saveSession: vi.fn() }));
vi.mock('../../services/session/session-store.js', () => mocks);

import Data from './data.js';
import PriceChart from './price-chart.js';
import Search from './search.js';

const root = resolve(import.meta.dirname, '../../..');

afterEach(() => {
  vi.restoreAllMocks();
  mocks.loadSession.mockReset();
});

function mockFetch() {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () => new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
    );
}

it('posts a search without a stored session', async () => {
  const fetch = mockFetch();
  vi.spyOn(Search.prototype, 'log').mockImplementation(() => undefined);

  await Search.run(['--query', 'volvo', '--types', 'STOCK,INDEX', '--limit', '5', '--json'], {
    root,
  });

  const [url, init] = fetch.mock.calls[0]!;
  expect(new URL(url.toString()).pathname).toBe('/_api/search/filtered-search');
  expect(JSON.parse(String(init?.body))).toEqual({
    query: 'volvo',
    searchFilter: { types: ['STOCK', 'INDEX'] },
    pagination: { from: 0, size: 5 },
  });
  expect(mocks.loadSession).not.toHaveBeenCalled();
});

it('passes a custom price chart range and resolution', async () => {
  const fetch = mockFetch();
  vi.spyOn(PriceChart.prototype, 'log').mockImplementation(() => undefined);

  await PriceChart.run(
    ['--orderbook-id', '5269', '--from', '2026-01-01', '--to', '2026-02-01', '--resolution', 'day'],
    { root },
  );

  const url = new URL(fetch.mock.calls[0]![0].toString());
  expect(url.pathname).toBe('/_api/price-chart/stock/5269');
  expect(Object.fromEntries(url.searchParams)).toEqual({
    from: '2026-01-01',
    to: '2026-02-01',
    resolution: 'day',
  });
});

it('rejects a period combined with a custom range', async () => {
  const fetch = mockFetch();

  await expect(
    PriceChart.run(
      [
        '--orderbook-id',
        '5269',
        '--period',
        'one_year',
        '--from',
        '2026-01-01',
        '--to',
        '2026-02-01',
      ],
      { root },
    ),
  ).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});

it('reads market data with the stored session', async () => {
  mocks.loadSession.mockResolvedValue({
    mode: 'totp',
    authenticationSession: 'session',
    securityToken: 'token',
  });
  const fetch = mockFetch();
  vi.spyOn(Data.prototype, 'log').mockImplementation(() => undefined);

  await Data.run(['--orderbook-id', '5269', '--json'], { root });

  const [url, init] = fetch.mock.calls[0]!;
  expect(new URL(url.toString()).pathname).toBe('/_api/trading-critical/rest/marketdata/5269');
  expect(new Headers(init?.headers).get('X-AuthenticationSession')).toBe('session');
});
