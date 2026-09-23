import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import Etfs from './etfs.js';

const root = resolve(import.meta.dirname, '../../..');

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch() {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () => new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
    );
}

it('posts the ETF filter, page, and sort order', async () => {
  const fetch = mockFetch();
  vi.spyOn(Etfs.prototype, 'log').mockImplementation(() => undefined);

  await Etfs.run(
    ['--filter', '{"issuers":["xact"]}', '--limit', '5', '--sort-field', 'name', '--order', 'asc'],
    { root },
  );

  const [url, init] = fetch.mock.calls[0]!;
  expect(new URL(url.toString()).pathname).toBe('/_api/market-etf-filter/');
  expect(JSON.parse(String(init?.body))).toEqual({
    filter: { issuers: ['xact'] },
    offset: 0,
    limit: 5,
    sortBy: { field: 'name', order: 'asc' },
  });
});

it('rejects a filter that is not a JSON object', async () => {
  const fetch = mockFetch();

  await expect(Etfs.run(['--filter', '[1]'], { root })).rejects.toThrow(
    '--filter must be a JSON object.',
  );
  expect(fetch).not.toHaveBeenCalled();
});
