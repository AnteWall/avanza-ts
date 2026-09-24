import { expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { expectFixtureReplay, jsonResponse, loadHttpFixture } from '../test-utils/http.js';

const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' } as const;

function setup(authenticated = false) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => jsonResponse({}));
  const client = new AvanzaClient({
    baseUrl: 'https://example.test',
    fetch,
    ...(authenticated ? { session } : {}),
  });
  const paths = () =>
    fetch.mock.calls.map(([url, init]) => {
      const { pathname, search } = new URL(url.toString());
      return [init?.method, pathname + search];
    });
  return { client, fetch, paths };
}

it('gets an article by feed URL or path without a session', async () => {
  const { client, paths } = setup();
  await client.news.article('https://www.placera.se/telegram/avanza/13_abc');
  await client.news.article('/nyheter/a b');
  expect(paths()).toEqual([
    ['GET', '/_api/news/article/telegram/avanza/13_abc'],
    ['GET', '/_api/news/article/nyheter/a%20b'],
  ]);
  expect(() => client.news.article('/')).toThrow(TypeError);
});

it('gets the news feed and calendar with a session', async () => {
  const { client, paths } = setup(true);
  await client.news.feed();
  await client.news.feed({ count: 3, maxDays: 7 });
  await client.news.calendar();
  await client.news.offers();
  expect(paths()).toEqual([
    ['GET', '/_api/customer-news-feed-v2/news?count=10&maxDays=30'],
    ['GET', '/_api/customer-news-feed-v2/news?count=3&maxDays=7'],
    ['GET', '/_api/customer-calendar/calendar'],
    ['GET', '/_api/customer-offer/currentoffers/'],
  ]);
});

it('requires a session for the feed', async () => {
  const { client, fetch } = setup();
  await expect(client.news.feed()).rejects.toBeInstanceOf(AvanzaAuthenticationRequiredError);
  expect(fetch).not.toHaveBeenCalled();
});

it.each<[string, (client: AvanzaClient) => Promise<unknown>]>([
  ['article', (c) => c.news.article('https://www.placera.se/telegram/avanza/13_synthetic')],
  ['feed', (c) => c.news.feed({ count: 2 })],
  ['calendar', (c) => c.news.calendar()],
])('replays an anonymized %s capture', (name, call) =>
  expectFixtureReplay(`news/fixtures/${name}.json`, call),
);

it('links feed items to fetchable article URLs', async () => {
  const { response } = loadHttpFixture<{ news: { url: string }[] }>('news/fixtures/feed.json');
  await expectFixtureReplay('news/fixtures/article.json', (c) =>
    c.news.article(response.body.news[0]!.url),
  );
});
