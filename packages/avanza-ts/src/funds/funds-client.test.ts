import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { chartPeriods } from '../market/market-types.js';
import { expectFixtureReplay, jsonResponse, loadHttpFixture } from '../test-utils/http.js';
import type { FundsClient } from './funds-client.js';

function setup(session = false) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => jsonResponse({}));
  const client = new AvanzaClient({
    baseUrl: 'https://example.test',
    fetch,
    ...(session
      ? { session: { authenticationSession: 'session', mode: 'totp', securityToken: 'token' } }
      : {}),
  });
  const request = () => {
    const [url, init] = fetch.mock.calls[0]!;
    const { pathname, search } = new URL(url.toString());
    return {
      method: init?.method,
      path: pathname + search,
      body: init?.body === undefined ? undefined : (JSON.parse(String(init.body)) as unknown),
    };
  };
  return { client, fetch, request };
}

describe('FundsClient', () => {
  it.each<[string, (funds: FundsClient) => Promise<unknown>, string]>([
    [
      'instrument search',
      (f) => f.instrumentSearch('zero'),
      '/_api/fund-guide/instrument-search?query=zero',
    ],
    ['top ten', (f) => f.topTen(), '/_api/fund-guide/top-ten?fundInstrumentType=FUND'],
    [
      'top ten sorted',
      (f) =>
        f.topTen({
          sortField: 'developmentOneYear',
          sortDirection: 'ASCENDING',
          fundInstrumentType: 'BOTH',
        }),
      '/_api/fund-guide/top-ten?sortField=developmentOneYear&sortDirection=ASCENDING&fundInstrumentType=BOTH',
    ],
    ['guide', (f) => f.guide('41567'), '/_api/fund-guide/guide/41567'],
    ['description', (f) => f.description('41567'), '/_api/fund-guide/description/41567'],
    ['orderbook', (f) => f.orderbook('41567'), '/_api/fund-guide/fund-orderbook/41567'],
    ['details', (f) => f.details('41567'), '/_api/fund-guide/fund-orderbook/details/41567'],
    [
      'holdings',
      (f) => f.holdings('41567'),
      '/_api/fund-guide/fund-orderbook/piechart/holdings/41567',
    ],
    [
      'regions',
      (f) => f.regions('41567'),
      '/_api/fund-guide/fund-orderbook/piechart/regions/41567',
    ],
    [
      'sectors',
      (f) => f.sectors('41567'),
      '/_api/fund-guide/fund-orderbook/piechart/sectors/41567',
    ],
    ['chart', (f) => f.chart('41567', 'one_year'), '/_api/fund-guide/chart/41567/one_year'],
    ['chart periods', (f) => f.chartPeriods('41567'), '/_api/fund-guide/chart/timeperiods/41567'],
    ['reference', (f) => f.reference('41567'), '/_api/fund-reference/reference/41567'],
    ['development', (f) => f.development('41567'), '/_api/fund-reference/development/41567'],
    ['portfolio', (f) => f.portfolioData('41567'), '/_api/fund-reference/portfolio-data/41567'],
    [
      'sustainability',
      (f) => f.sustainability('41567'),
      '/_api/fund-reference/sustainability/41567',
    ],
  ])('gets %s without a session', async (_, call, path) => {
    const { client, request } = setup();
    await call(client.funds);
    expect(request()).toEqual({ method: 'GET', path, body: undefined });
  });

  it('posts a fund search', async () => {
    const { client, request } = setup();
    await client.funds.search('zero');
    expect(request()).toEqual({
      method: 'POST',
      path: '/_api/fund-guide/search',
      body: { name: 'zero' },
    });
    expect(() => client.funds.search(' ')).toThrow(TypeError);
  });

  it('posts a fund list with defaults and filters', async () => {
    const { client, request } = setup();
    await client.funds.list({ maxNoResults: 5, filter: { riskFilter: ['2'] } });
    expect(request()).toEqual({
      method: 'POST',
      path: '/_api/fund-guide/list',
      body: {
        riskFilter: ['2'],
        name: '',
        sortField: 'developmentThreeYears',
        sortDirection: 'DESCENDING',
        startIndex: 0,
        maxNoResults: 5,
      },
    });
  });

  it('requires a session for favourites', async () => {
    const { client, fetch } = setup();
    await expect(client.funds.favourites()).rejects.toBeInstanceOf(
      AvanzaAuthenticationRequiredError,
    );
    expect(fetch).not.toHaveBeenCalled();

    const authenticated = setup(true);
    await authenticated.client.funds.isFavourite('41567');
    expect(authenticated.request().path).toBe('/_api/fund-guide/is-favourite/41567');
  });
});

describe('FundsClient recorded responses', () => {
  it.each<[string, (client: AvanzaClient) => Promise<unknown>]>([
    ['search', (c) => c.funds.search('zero')],
    ['guide', (c) => c.funds.guide('41567')],
    ['list', (c) => c.funds.list({ maxNoResults: 2 })],
    ['top-ten', (c) => c.funds.topTen()],
    ['details', (c) => c.funds.details('41567')],
    ['holdings', (c) => c.funds.holdings('41567')],
    ['chart', (c) => c.funds.chart('41567', 'one_week')],
    ['chart-periods', (c) => c.funds.chartPeriods('41567')],
    ['reference', (c) => c.funds.reference('41567')],
    ['portfolio-data', (c) => c.funds.portfolioData('41567')],
    ['sustainability', (c) => c.funds.sustainability('41567')],
  ])('replays %s', (name, call) => expectFixtureReplay(`funds/fixtures/${name}.json`, call));

  it('returns chart periods accepted by chart()', () => {
    const { response } = loadHttpFixture<{ timePeriod: string }[]>(
      'funds/fixtures/chart-periods.json',
    );
    for (const { timePeriod } of response.body) expect(chartPeriods).toContain(timePeriod);
  });
});
