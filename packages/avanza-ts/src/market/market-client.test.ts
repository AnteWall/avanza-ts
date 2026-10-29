import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { expectFixtureReplay, jsonResponse } from '../test-utils/http.js';
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
    ['stock', (m) => m.stock('5269'), '/market-guide/stock/5269', {}],
    ['stock analysis', (m) => m.stockAnalysis('5269'), '/market-guide/stock/5269/analysis', {}],
    [
      'sector analysis',
      (m) => m.sectorAnalysis('5269'),
      '/market-stock-analysis/analysis/5269/sector',
      {},
    ],
    ['marketplace', (m) => m.marketplace('5269'), '/market-guide/stock/5269/marketplace', {}],
    ['owners', (m) => m.numberOfOwners('5269'), '/market-guide/number-of-owners/5269', {}],
    [
      'instrument',
      (m) => m.instrument('certificate', '563966'),
      '/market-guide/certificate/563966',
      {},
    ],
    [
      'instrument details',
      (m) => m.instrumentDetails('option', '2631305'),
      '/market-guide/option/2631305/details',
      {},
    ],
    ['news', (m) => m.news('5269'), '/market-guide/news/5269', {}],
    [
      'insider trades',
      (m) => m.insiderTrades('5269'),
      '/market-insider-transactions/transactions/5269',
      {},
    ],
    [
      'market maker chart',
      (m) => m.marketMakerChart('563966', 'one_week'),
      '/price-chart/marketmaker/563966',
      { timePeriod: 'one_week' },
    ],
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

  it.each<[string, (market: MarketClient) => Promise<unknown>, string]>([
    ['estimates', (m) => m.stockEstimates('5269'), '/market-stock-analysis/analysis/5269'],
    [
      'recommendations',
      (m) => m.analystRecommendations('5269'),
      '/market-stock-analysis/estimate/recommendation/5269',
    ],
    [
      'estimate history',
      (m) => m.estimateHistory('5269'),
      '/market-stock-analysis/estimate/history/5269',
    ],
    ['morningstar', (m) => m.morningstarAnalysis('5269'), '/stock-analyses/5269'],
    [
      'analysis access',
      (m) => m.analysisAccess(),
      '/market-external-analysis/external-analysis/access',
    ],
    [
      'latest analyses',
      (m) => m.latestAnalyses('kepler'),
      '/market-external-analysis/latest-analysis-summary/kepler',
    ],
    [
      'latest analysis',
      (m) => m.latestAnalysis('placera', '5269'),
      '/market-external-analysis/latest-analysis-summary/placera/5269',
    ],
  ])('requires a session for %s', async (_name, call, path) => {
    const { client, fetch } = setup();
    await expect(call(client.market)).rejects.toBeInstanceOf(AvanzaAuthenticationRequiredError);
    expect(fetch).not.toHaveBeenCalled();

    const authed = setup({}, true);
    await call(authed.client.market);
    expect(authed.request()).toEqual({
      method: 'GET',
      path: `/_api${path}`,
      query: {},
      body: undefined,
    });
  });

  it('resolves a missing latest analysis to null', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: { authenticationSession: 'session', mode: 'totp', securityToken: 'token' },
    });
    await expect(client.market.latestAnalysis('placera', '5269')).resolves.toBeNull();
  });

  it('posts an analysis filter with only the given filters', async () => {
    const { client, request } = setup({ analyses: [] }, true);

    await client.market.filterAnalyses('kepler', {
      countryMarkets: ['se/xsto'],
      recommendations: ['buy'],
      limit: 2,
    });

    expect(request()).toMatchObject({
      method: 'POST',
      path: '/_api/market-external-analysis/filtered-analyses',
      body: {
        provider: 'KEPLER',
        dateFilter: {},
        recommendationFilter: { filterField: 'recommendation', values: ['buy'] },
        stringListFilters: [{ filterField: 'countryMarketList', values: ['se/xsto'] }],
        stringQueryFilters: [],
        offset: 0,
        limit: 2,
        sortBy: { field: 'publishDate', order: 'desc' },
      },
    });
  });

  it('rejects invalid input before sending', () => {
    const { client, fetch } = setup();
    expect(() => client.market.search(' ')).toThrow(TypeError);
    expect(() => client.market.quote('')).toThrow(TypeError);
    expect(() => client.market.technicalAnalysisPoints('5269', 'one_month', 0)).toThrow(TypeError);
    expect(fetch).not.toHaveBeenCalled();
  });
});

it.each<[string, (client: AvanzaClient) => Promise<unknown>]>([
  ['short-selling', (c) => c.market.shortSelling('5269')],
  ['recommendations', (c) => c.market.analystRecommendations('5269')],
  ['price-targets', (c) => c.market.priceTargets('5269')],
  ['sector-analysis', (c) => c.market.sectorAnalysis('5269')],
  ['stock', (c) => c.market.stock('5269')],
  ['certificate', (c) => c.market.instrument('certificate', '563966')],
])('replays a recorded %s response', (name, call) =>
  expectFixtureReplay(`market/fixtures/${name}.json`, call),
);
