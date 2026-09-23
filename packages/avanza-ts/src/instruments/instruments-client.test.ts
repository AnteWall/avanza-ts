import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { httpFixtureResponse, jsonResponse, loadHttpFixture } from '../test-utils/http.js';
import type { StockFilter } from './stock-screener-types.js';

describe('InstrumentsClient stock screener', () => {
  it('sends the default screener request and returns the paginated result', async () => {
    const fixture = loadHttpFixture('instruments/fixtures/stocks.json');
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(httpFixtureResponse('instruments/fixtures/stocks.json'));
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    await expect(client.instruments.screenStocks()).resolves.toEqual(fixture.response.body);
    expect(new URL(fetch.mock.calls[0]![0].toString()).pathname).toBe(
      '/_api/market-stock-filter/stocks',
    );
    expect(fetch.mock.calls[0]![1]?.method).toBe('POST');
    expect(JSON.parse(String(fetch.mock.calls[0]![1]?.body))).toEqual(fixture.request.body);
  });

  it('forwards filters, pagination, sorting and an optional session', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(httpFixtureResponse('instruments/fixtures/stocks.json'));
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        authenticationSession: 'session',
        mode: 'totp',
        securityToken: 'token',
      },
    });

    await client.instruments.screenStocks({
      filter: { sectors: ['38'], marketPlaces: ['se'], numberOfOwners: { minValue: 100 } },
      offset: 20,
      limit: 10,
      sortBy: { field: 'lastPrice', order: 'asc' },
    });

    expect(JSON.parse(String(fetch.mock.calls[0]![1]?.body))).toEqual({
      filter: {
        sectors: ['38'],
        marketPlaces: ['se'],
        numberOfOwners: { minValue: 100 },
      },
      offset: 20,
      limit: 10,
      sortBy: { field: 'lastPrice', order: 'asc' },
    });
    expect(new Headers(fetch.mock.calls[0]![1]?.headers).get('X-AuthenticationSession')).toBe(
      'session',
    );
  });

  it('rejects invalid requests and malformed responses', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(jsonResponse({ stocks: [] }));
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    await expect(client.instruments.screenStocks({ limit: -1 })).rejects.toThrow();
    await expect(
      client.instruments.screenStocks({
        filter: { priceEarningsRatio: 'bad' } as unknown as StockFilter,
      }),
    ).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
    await expect(client.instruments.screenStocks()).rejects.toThrow();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('queries themed stocks with orderbook IDs and sorting', async () => {
    const fixture = loadHttpFixture('instruments/fixtures/theme-stocks.json');
    const sortBy = { field: 'numberOfOwners', order: 'desc' } as const;
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(httpFixtureResponse('instruments/fixtures/theme-stocks.json'));
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    await expect(client.instruments.getThemeStocks(['5361'], sortBy)).resolves.toEqual(
      fixture.response.body,
    );
    expect(new URL(fetch.mock.calls[0]![0].toString()).pathname).toBe(fixture.request.path);
    expect(fetch.mock.calls[0]![1]?.method).toBe(fixture.request.method);
    expect(JSON.parse(String(fetch.mock.calls[0]![1]?.body))).toEqual(fixture.request.body);

    await expect(client.instruments.getThemeStocks([], sortBy)).rejects.toThrow();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('queries movers with a stock filter and validates the lightweight response', async () => {
    const fixture = loadHttpFixture('instruments/fixtures/gainers-losers.json');
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(httpFixtureResponse('instruments/fixtures/gainers-losers.json'))
      .mockResolvedValueOnce(jsonResponse({ gainers: [], losers: [] }));
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    await expect(client.instruments.getGainersLosers()).resolves.toEqual(fixture.response.body);
    expect(new URL(fetch.mock.calls[0]![0].toString()).pathname).toBe(fixture.request.path);
    expect(fetch.mock.calls[0]![1]?.method).toBe(fixture.request.method);
    expect(JSON.parse(String(fetch.mock.calls[0]![1]?.body))).toEqual(fixture.request.body);
    await expect(
      client.instruments.getGainersLosers({ sectors: 'bad' } as never),
    ).rejects.toThrow();
    expect(fetch).toHaveBeenCalledOnce();
    await expect(client.instruments.getGainersLosers()).rejects.toThrow();
  });

  it('forwards a custom movers filter', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(httpFixtureResponse('instruments/fixtures/gainers-losers.json'));
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    await client.instruments.getGainersLosers({ marketPlaces: ['se'] });
    expect(JSON.parse(String(fetch.mock.calls[0]![1]?.body))).toEqual({
      filter: { sectors: [], marketPlaces: ['se'] },
    });
  });

  it('routes public option and sector requests', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(httpFixtureResponse('instruments/fixtures/filter-options.json'))
      .mockResolvedValueOnce(
        jsonResponse([{ sectorId: '38', sectorName: 'Teknologi', illustrationName: 'tablet' }]),
      )
      .mockResolvedValueOnce(
        jsonResponse([{ sector: { sectorId: '38', sectorName: 'Teknologi' }, children: [] }]),
      );
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    const options = await client.instruments.getStockFilterOptions();
    expect(options).toEqual(
      loadHttpFixture('instruments/fixtures/filter-options.json').response.body,
    );
    await client.instruments.getPopularStockSectors();
    await client.instruments.getAllStockSectors();

    expect(
      fetch.mock.calls.map(([url, init]) => [new URL(url.toString()).pathname, init?.method]),
    ).toEqual([
      ['/_api/market-stock-filter/stocks/filter-options', 'GET'],
      ['/_api/market-stock-filter/sectors/popular', 'GET'],
      ['/_api/market-stock-filter/sectors/all', 'GET'],
    ]);
  });

  it('requires authentication for metadata and saved settings', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });

    const requests = [
      client.instruments.getStockScreenerMetadata(),
      client.instruments.getStockScreenerTabs(),
      client.instruments.getSavedStockFilters(),
      client.instruments.saveStockScreenerTabs([]),
      client.instruments.deleteStockScreenerTabs(),
      client.instruments.saveStockFilters([]),
    ];
    const results = await Promise.allSettled(requests);
    expect(results).toHaveLength(6);
    for (const result of results) {
      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') {
        expect(result.reason).toBeInstanceOf(AvanzaAuthenticationRequiredError);
      }
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends saved settings in the page API format', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (url) => {
      const path = new URL(url.toString()).pathname;
      if (path.endsWith('/metadata')) return jsonResponse({ metadata: {} });
      if (path.endsWith('/tabs')) return jsonResponse({ tabs: [] });
      if (path.endsWith('/filters')) return jsonResponse({ filters: [] });
      return jsonResponse({});
    });
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: { authenticationSession: 'session', mode: 'totp', securityToken: 'token' },
    });
    const tabs = [{ name: 'My tab', columns: ['NUMBER_OF_OWNERS'] }];
    const filters = [{ name: 'Sweden', filter: { sectors: [], marketPlaces: ['se'] } }];

    await client.instruments.getStockScreenerMetadata();
    await client.instruments.getStockScreenerTabs();
    await client.instruments.saveStockScreenerTabs(tabs);
    await client.instruments.deleteStockScreenerTabs();
    await client.instruments.getSavedStockFilters();
    await client.instruments.saveStockFilters(filters);

    expect(
      fetch.mock.calls.map(([url, init]) => [new URL(url.toString()).pathname, init?.method]),
    ).toEqual([
      ['/_api/market-stock-filter/stocks/metadata', 'GET'],
      ['/_api/market-stock-filter/settings/tabs', 'GET'],
      ['/_api/market-stock-filter/settings/save-tabs', 'POST'],
      ['/_api/market-stock-filter/settings/delete-tabs', 'DELETE'],
      ['/_api/market-stock-filter/settings/filters', 'GET'],
      ['/_api/market-stock-filter/settings/save-filters', 'POST'],
    ]);
    expect(JSON.parse(String(fetch.mock.calls[2]![1]?.body))).toEqual({ tabs });
    expect(JSON.parse(String(fetch.mock.calls[5]![1]?.body))).toEqual({ filters });
  });
});
