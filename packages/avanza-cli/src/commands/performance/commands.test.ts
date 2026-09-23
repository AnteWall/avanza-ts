import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loadSession: vi.fn(), saveSession: vi.fn() }));
vi.mock('../../services/session/session-store.js', () => mocks);

import TransactionsList from '../transactions/list.js';
import Chart from './chart.js';

const root = resolve(import.meta.dirname, '../../..');

afterEach(() => {
  vi.restoreAllMocks();
  mocks.loadSession.mockReset();
});

function mockFetch() {
  mocks.loadSession.mockResolvedValue({
    mode: 'totp',
    authenticationSession: 'session',
    securityToken: 'token',
  });
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () => new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
    );
}

it('posts a custom performance range with the stored session', async () => {
  const fetch = mockFetch();
  vi.spyOn(Chart.prototype, 'log').mockImplementation(() => undefined);

  await Chart.run(
    ['--from', '2025-01-01', '--to', '2025-02-01', '--account-ids', 'a,b', '--json'],
    { root },
  );

  const [url, init] = fetch.mock.calls[0]!;
  expect(new URL(url.toString()).pathname).toBe(
    '/_api/account-performance/overview/chart/accounts/timeperiod_custom',
  );
  expect(init?.method).toBe('POST');
  expect(JSON.parse(String(init?.body))).toEqual({
    from: '2025-01-01',
    to: '2025-02-01',
    scrambledAccountIds: ['a', 'b'],
    includeClosedAccounts: false,
  });
  expect(new Headers(init?.headers).get('X-AuthenticationSession')).toBe('session');
});

it('rejects a period combined with a custom range', async () => {
  const fetch = mockFetch();

  await expect(
    Chart.run(['--period', 'ONE_YEAR', '--from', '2025-01-01', '--to', '2025-02-01'], { root }),
  ).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});

it('passes transaction filters as query parameters', async () => {
  const fetch = mockFetch();
  vi.spyOn(TransactionsList.prototype, 'log').mockImplementation(() => undefined);

  await TransactionsList.run(['--from', '2025-01-01', '--types', 'BUY,SELL', '--json'], { root });

  const url = new URL(fetch.mock.calls[0]![0].toString());
  expect(url.pathname).toBe('/_api/transactions/list');
  expect(url.searchParams.get('from')).toBe('2025-01-01');
  expect(url.searchParams.getAll('transactionTypes')).toEqual(['BUY', 'SELL']);
  expect(fetch.mock.calls[0]![1]?.method).toBe('GET');
});
