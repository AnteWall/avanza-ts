import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { jsonResponse } from '../test-utils/http.js';
import type { MarketClient } from './market-client.js';

function setup(body: unknown = {}, session = false) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(jsonResponse(body));
  const client = new AvanzaClient({
    baseUrl: 'https://example.test',
    fetch,
    ...(session
      ? { session: { authenticationSession: 'session', mode: 'totp', securityToken: 'token' } }
      : {}),
  });
  const request = () => {
    const [url, init] = fetch.mock.calls[0]!;
    const parsed = new URL(url.toString());
    return {
      method: init?.method,
      path: parsed.pathname,
      query: Object.fromEntries(parsed.searchParams),
      body: init?.body === undefined ? undefined : (JSON.parse(String(init.body)) as unknown),
    };
  };
  return { client, fetch, request };
}

describe('MarketClient', () => {
  it.each<[string, (market: MarketClient) => Promise<unknown>, string, Record<string, string>]>([
    [
      'isin',
      (m) => m.instrumentByIsin('SE0000115446'),
      '/market-guide/instrument/isin/SE0000115446',
      {},
    ],
    ['quote', (m) => m.quote('5269'), '/market-guide/stock/5269/quote', {}],
    ['order depth', (m) => m.orderDepth('5269'), '/market-guide/stock/5269/orderdepth', {}],
    ['trades', (m) => m.trades('5269'), '/market-guide/stock/5269/trades', {}],
    [
      'broker trades',
      (m) => m.brokerTradeSummaries('5269'),
      '/market-guide/stock/5269/broker-trade-summaries',
      {},
    ],
    ['short selling', (m) => m.shortSelling('5269'), '/market-guide/short-selling/5269', {}],
    ['header indices', (m) => m.headerIndices(), '/market-index/header-index', {}],
    ['constituents', (m) => m.indexConstituents('19002'), '/market-index/19002/constituents', {}],
    ['etf', (m) => m.etf('5510'), '/market-etf/5510', {}],
    ['etf details', (m) => m.etfDetails('5510'), '/market-etf/5510/details', {}],
    ['overviews', (m) => m.overviews(), '/market-overview/overviews', {}],
    [
      'overview chart',
      (m) => m.overviewChart('5269', 'one_month'),
      '/market-overview/chart/5269/one_month',
      { raw: 'false' },
    ],
    [
      'chart periods',
      (m) => m.overviewChartPeriods('5269'),
      '/market-overview/chart/timeperiods/5269',
      {},
    ],
    [
      'price chart',
      (m) => m.priceChart('5269', 'one_month', { resolution: 'day' }),
      '/price-chart/stock/5269',
      { timePeriod: 'one_month', resolution: 'day' },
    ],
    [
      'price chart range',
      (m) => m.priceChart('5269', { from: '2026-01-01', to: '2026-02-01' }),
      '/price-chart/stock/5269',
      { from: '2026-01-01', to: '2026-02-01' },
    ],
    [
      'company events',
      (m) => m.companyEvents('5269', 'five_years'),
      '/price-chart/stock/5269/company-events',
      { timePeriod: 'five_years' },
    ],
    [
      'insider transactions',
      (m) => m.insiderTransactions('5269', 'one_year'),
      '/price-chart/stock/5269/insider-transactions',
      { timePeriod: 'one_year' },
    ],
    [
      'technical analysis',
      (m) => m.technicalAnalysisPoints('5269', 'one_month', 3, { resolution: 'day' }),
      '/price-chart/stock/5269/ta/',
      { timePeriod: 'one_month', resolution: 'day', ta: '3' },
    ],
  ])('gets %s without a session', async (_name, call, path, query) => {
    const { client, request } = setup([{ ok: true }]);

    await expect(call(client.market)).resolves.toEqual([{ ok: true }]);
    expect(request()).toEqual({ method: 'GET', path: `/_api${path}`, query, body: undefined });
  });

  it('posts a search with types and pagination', async () => {
    const { client, request } = setup({ hits: [] });

    await client.market.search('volvo', { types: ['STOCK'], size: 5 });

    expect(request()).toMatchObject({
      method: 'POST',
      path: '/_api/search/filtered-search',
      body: {
        query: 'volvo',
        searchFilter: { types: ['STOCK'] },
        pagination: { from: 0, size: 5 },
      },
    });
  });

  it('requires a session for trading market data', async () => {
    const { client, fetch } = setup();
    await expect(client.market.marketData('5269')).rejects.toBeInstanceOf(
      AvanzaAuthenticationRequiredError,
    );
    expect(fetch).not.toHaveBeenCalled();

    const authed = setup({ trades: [] }, true);
    await authed.client.market.marketData('5269');
    expect(authed.request().path).toBe('/_api/trading-critical/rest/marketdata/5269');
  });

  it('rejects invalid input before sending', () => {
    const { client, fetch } = setup();
    expect(() => client.market.search(' ')).toThrow(TypeError);
    expect(() => client.market.quote('')).toThrow(TypeError);
    expect(() => client.market.technicalAnalysisPoints('5269', 'one_month', 0)).toThrow(TypeError);
    expect(fetch).not.toHaveBeenCalled();
  });
});
