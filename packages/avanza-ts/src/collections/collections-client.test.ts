import { expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { expectFixtureReplay, jsonResponse } from '../test-utils/http.js';

const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' } as const;

function setup() {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => jsonResponse([]));
  const { collections } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });
  const requests = () =>
    fetch.mock.calls.map(([url, init]) => {
      const { pathname, search } = new URL(url.toString());
      return [
        init?.method,
        pathname + search,
        init?.body === undefined ? undefined : JSON.parse(String(init.body)),
      ];
    });
  return { collections, requests };
}

it('requires a session', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
  await expect(client.collections.watchlists()).rejects.toBeInstanceOf(
    AvanzaAuthenticationRequiredError,
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('gets watchlists, alerts, and notes', async () => {
  const { collections, requests } = setup();
  await collections.watchlists();
  await collections.alerts();
  await collections.triggeredAlerts();
  await collections.notes();
  await collections.notes('5269');
  await collections.noteOrderbooks();
  expect(requests()).toEqual([
    ['GET', '/_api/watchlist/watchlist', undefined],
    ['GET', '/_api/alert/alerts', undefined],
    ['GET', '/_api/alert/alerts/triggered-alerts', undefined],
    ['GET', '/_api/user-note/', undefined],
    ['GET', '/_api/user-note/?orderbookId=5269', undefined],
    ['GET', '/_api/user-note/available-orderbooks', undefined],
  ]);
});

it('posts watchlist data and news queries', async () => {
  const { collections, requests } = setup();
  await collections.watchlistData('w1', ['1', '2']);
  await collections.watchlistData('w1', ['1'], ['NUMBER_OF_OWNERS', 'ONE_YEAR_PERFORMANCE']);
  await collections.watchlistNews(['1'], { categories: ['PRESS_RELEASE'] });
  expect(requests()).toEqual([
    [
      'POST',
      '/_api/watchlist/data/by-id',
      { watchListId: 'w1', orderbookIds: ['1', '2'], orderbookDataPoints: ['LAST_PRICE'] },
    ],
    [
      'POST',
      '/_api/watchlist/data/by-id',
      {
        watchListId: 'w1',
        orderbookIds: ['1'],
        orderbookDataPoints: ['NUMBER_OF_OWNERS', 'ONE_YEAR_PERFORMANCE'],
      },
    ],
    ['POST', '/_api/watchlist/news', { orderbookIds: ['1'], categories: ['PRESS_RELEASE'] }],
  ]);
  expect(() => collections.watchlistNews([])).toThrow(TypeError);
});

it.each<[string, (client: AvanzaClient) => Promise<unknown>]>([
  ['watchlists', (c) => c.collections.watchlists()],
  [
    'watchlist-data',
    (c) =>
      c.collections.watchlistData(
        'synthetic-13',
        ['synthetic-14'],
        ['LAST_PRICE', 'ONE_YEAR_PERFORMANCE', 'NUMBER_OF_OWNERS'],
      ),
  ],
  ['watchlist-news', (c) => c.collections.watchlistNews(['synthetic-14'])],
  ['notes', (c) => c.collections.notes()],
])('replays an anonymized %s capture', (name, call) =>
  expectFixtureReplay(`collections/fixtures/${name}.json`, call),
);
