import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loadSession: vi.fn(), saveSession: vi.fn() }));
vi.mock('../../services/session/session-store.js', () => mocks);

import List from './list.js';
import TopTen from './top-ten.js';

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

it('posts a fund list with filters and paging', async () => {
  const fetch = mockFetch();
  vi.spyOn(List.prototype, 'log').mockImplementation(() => undefined);

  await List.run(
    ['--filter', '{"riskFilter":["2"]}', '--order', 'asc', '--offset', '20', '--limit', '5'],
    { root },
  );

  const [url, init] = fetch.mock.calls[0]!;
  expect(new URL(url.toString()).pathname).toBe('/_api/fund-guide/list');
  expect(JSON.parse(String(init?.body))).toEqual({
    riskFilter: ['2'],
    name: '',
    sortField: 'developmentThreeYears',
    sortDirection: 'ASCENDING',
    startIndex: 20,
    maxNoResults: 5,
  });
  expect(mocks.loadSession).not.toHaveBeenCalled();
});

it('rejects a non-object fund filter', async () => {
  await expect(List.run(['--filter', '[]'], { root })).rejects.toThrow(
    '--filter must be a JSON object.',
  );
});

it('maps top-ten flags to query parameters', async () => {
  const fetch = mockFetch();
  vi.spyOn(TopTen.prototype, 'log').mockImplementation(() => undefined);

  await TopTen.run(['--sort-field', 'developmentOneYear', '--order', 'desc', '--type', 'BOTH'], {
    root,
  });

  const { pathname, search } = new URL(fetch.mock.calls[0]![0].toString());
  expect(pathname + search).toBe(
    '/_api/fund-guide/top-ten?sortField=developmentOneYear&sortDirection=DESCENDING&fundInstrumentType=BOTH',
  );
});
