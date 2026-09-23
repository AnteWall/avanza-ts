import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loadSession: vi.fn(), saveSession: vi.fn() }));
vi.mock('../../services/session/session-store.js', () => mocks);

import WatchlistData from './watchlist-data.js';

const root = resolve(import.meta.dirname, '../../..');
const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' };

afterEach(() => {
  vi.restoreAllMocks();
  mocks.loadSession.mockReset();
});

it('looks up watchlist orderbooks before querying data', async () => {
  mocks.loadSession.mockResolvedValue(session);
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () =>
      new Response(JSON.stringify([{ watchListId: 'w1', orderbookIds: ['1', '2'] }]), {
        headers: { 'Content-Type': 'application/json' },
      }),
  );
  vi.spyOn(WatchlistData.prototype, 'log').mockImplementation(() => undefined);

  await WatchlistData.run(['--watchlist-id', 'w1', '--data-points', 'LAST_PRICE,BETA'], { root });

  expect(new URL(fetch.mock.calls[0]![0].toString()).pathname).toBe('/_api/watchlist/watchlist');
  const [url, init] = fetch.mock.calls[1]!;
  expect(new URL(url.toString()).pathname).toBe('/_api/watchlist/data/by-id');
  expect(JSON.parse(String(init?.body))).toEqual({
    watchListId: 'w1',
    orderbookIds: ['1', '2'],
    orderbookDataPoints: ['LAST_PRICE', 'BETA'],
  });
});

it('rejects an unknown watchlist', async () => {
  mocks.loadSession.mockResolvedValue(session);
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () => new Response('[]', { headers: { 'Content-Type': 'application/json' } }),
  );
  await expect(WatchlistData.run(['--watchlist-id', 'missing'], { root })).rejects.toThrow(
    'Watchlist missing not found.',
  );
});
