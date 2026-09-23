import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loadSession: vi.fn(), saveSession: vi.fn() }));
vi.mock('../../services/session/session-store.js', () => mocks);

import FiltersList from './filters/list.js';
import FiltersSave from './filters/save.js';
import GainersLosers from './gainers-losers.js';
import Metadata from './metadata.js';
import Stocks from './stocks.js';
import TabsDelete from './tabs/delete.js';
import TabsList from './tabs/list.js';
import TabsSave from './tabs/save.js';
import ThemeStocks from './theme-stocks.js';

const packageRoot = resolve(import.meta.dirname, '../../..');

afterEach(() => {
  vi.restoreAllMocks();
  mocks.loadSession.mockReset();
  mocks.saveSession.mockReset();
});

describe('stock screener CLI', () => {
  it('captures fixture requests and responses for themed stocks and movers', async () => {
    const themeBody = { stocks: [], sortBy: { field: 'numberOfOwners', order: 'desc' } };
    const moversBody = {
      gainers: [],
      losers: [],
      numberOfGainers: 0,
      numberOfLosers: 0,
      numberOfNeutrals: 0,
    };
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(
        async (url) =>
          new Response(
            JSON.stringify(
              new URL(url.toString()).pathname.endsWith('/theme-stocks') ? themeBody : moversBody,
            ),
            { headers: { 'Content-Type': 'application/json' } },
          ),
      );
    const themeLog = vi.spyOn(ThemeStocks.prototype, 'log').mockImplementation(() => undefined);
    const moversLog = vi.spyOn(GainersLosers.prototype, 'log').mockImplementation(() => undefined);

    await ThemeStocks.run(['--orderbook-ids', '5361', '--fixture'], { root: packageRoot });
    await GainersLosers.run(['--fixture'], { root: packageRoot });

    expect(JSON.parse(themeLog.mock.calls[0]![0]!)).toEqual({
      request: {
        method: 'POST',
        path: '/_api/market-stock-filter/stocks/theme-stocks',
        body: { orderbookIds: ['5361'], sortBy: themeBody.sortBy },
      },
      response: { status: 200, body: themeBody },
    });
    expect(JSON.parse(moversLog.mock.calls[0]![0]!)).toEqual({
      request: {
        method: 'POST',
        path: '/_api/market-stock-filter/stocks/gainers-losers',
        body: { filter: { sectors: [], marketPlaces: [] } },
      },
      response: { status: 200, body: moversBody },
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('routes public themed stocks and movers queries with their request bodies', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (url) =>
        new Response(
          JSON.stringify(
            new URL(url.toString()).pathname.endsWith('/theme-stocks')
              ? { stocks: [], sortBy: { field: 'lastPrice', order: 'asc' } }
              : {
                  gainers: [],
                  losers: [],
                  numberOfGainers: 0,
                  numberOfLosers: 0,
                  numberOfNeutrals: 0,
                },
          ),
          { headers: { 'Content-Type': 'application/json' } },
        ),
    );
    vi.spyOn(ThemeStocks.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(GainersLosers.prototype, 'log').mockImplementation(() => undefined);

    await ThemeStocks.run(
      ['--orderbook-ids', '10001, 10002', '--sort-field', 'lastPrice', '--order', 'asc'],
      { root: packageRoot },
    );
    await GainersLosers.run(['--filter', '{"marketPlaces":["se"]}'], { root: packageRoot });

    expect(
      fetch.mock.calls.map(([url, init]) => [
        new URL(url.toString()).pathname,
        init?.method,
        JSON.parse(String(init?.body)),
      ]),
    ).toEqual([
      [
        '/_api/market-stock-filter/stocks/theme-stocks',
        'POST',
        { orderbookIds: ['10001', '10002'], sortBy: { field: 'lastPrice', order: 'asc' } },
      ],
      [
        '/_api/market-stock-filter/stocks/gainers-losers',
        'POST',
        { filter: { sectors: [], marketPlaces: ['se'] } },
      ],
    ]);
  });

  it('rejects invalid query flags before fetching', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    await expect(
      ThemeStocks.run(['--orderbook-ids', '10001,'], { root: packageRoot }),
    ).rejects.toThrow('--orderbook-ids must contain nonempty IDs');
    await expect(
      GainersLosers.run(['--filter', '{"sectors":"bad"}'], { root: packageRoot }),
    ).rejects.toThrow('--filter must be a JSON object');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('captures the request and response for a stock search fixture', async () => {
    mocks.loadSession.mockResolvedValue(undefined);
    const body = {
      stocks: [],
      filter: { sectors: [], marketPlaces: [] },
      pagination: { offset: 20, limit: 10 },
      sortBy: { field: 'numberOfOwners', order: 'desc' },
      totalNumberOfOrderbooks: 0,
      filterOptions: { countryCodes: [], marketPlaces: [], sectors: [] },
    };
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(JSON.stringify(body), {
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    const log = vi.spyOn(Stocks.prototype, 'log').mockImplementation(() => undefined);

    await Stocks.run(
      ['--filter', '{"sectors":["38"]}', '--offset', '20', '--limit', '10', '--fixture'],
      { root: packageRoot },
    );

    const fixture = JSON.parse(log.mock.calls[0]![0]!) as {
      request: { method: string; path: string; body: unknown };
      response: { status: number; body: unknown };
    };
    expect(fixture.request).toEqual({
      method: 'POST',
      path: '/_api/market-stock-filter/stocks',
      body: {
        filter: { sectors: ['38'], marketPlaces: [] },
        offset: 20,
        limit: 10,
        sortBy: { field: 'numberOfOwners', order: 'desc' },
      },
    });
    expect(fixture.response).toEqual({ status: 200, body });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('rejects invalid filters and settings before making requests', async () => {
    mocks.loadSession.mockResolvedValue(undefined);
    const fetch = vi.spyOn(globalThis, 'fetch');

    await expect(
      Stocks.run(['--filter', '{"sectors":"bad"}'], { root: packageRoot }),
    ).rejects.toThrow('--filter must be a JSON object');
    await expect(
      TabsSave.run(['--data', '{"name":"bad"}'], {
        root: packageRoot,
      }),
    ).rejects.toThrow('--data must be a JSON array');
    mocks.loadSession.mockResolvedValue({
      authenticationSession: 'session',
      mode: 'totp',
      securityToken: 'token',
    });
    await expect(
      TabsSave.run(['--data', '[{"name":"Bad","columns":42}]'], {
        root: packageRoot,
      }),
    ).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the stored session for authenticated settings', async () => {
    mocks.loadSession.mockResolvedValue({
      authenticationSession: 'session',
      mode: 'totp',
      securityToken: 'token',
    });
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ tabs: [{ name: 'My tab', columns: ['NUMBER_OF_OWNERS'] }] }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const log = vi.spyOn(TabsList.prototype, 'log').mockImplementation(() => undefined);

    await TabsList.run(['--json'], { root: packageRoot });

    expect(JSON.parse(log.mock.calls[0]![0]!)).toEqual({
      tabs: [{ name: 'My tab', columns: ['NUMBER_OF_OWNERS'] }],
    });
    expect(new Headers(fetch.mock.calls[0]![1]?.headers).get('X-AuthenticationSession')).toBe(
      'session',
    );
  });

  it('routes each signed-in subcommand to its endpoint', async () => {
    mocks.loadSession.mockResolvedValue({
      authenticationSession: 'session',
      mode: 'totp',
      securityToken: 'token',
    });
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const path = new URL(input.toString()).pathname;
      const body = path.endsWith('/metadata')
        ? { metadata: {} }
        : path.endsWith('/tabs')
          ? { tabs: [] }
          : path.endsWith('/filters')
            ? { filters: [] }
            : {};
      return new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
      });
    });
    for (const command of [Metadata, TabsList, TabsSave, TabsDelete, FiltersList, FiltersSave]) {
      vi.spyOn(command.prototype, 'log').mockImplementation(() => undefined);
    }

    await Metadata.run([], { root: packageRoot });
    await TabsList.run([], { root: packageRoot });
    await TabsSave.run(['--data', '[{"name":"My tab","columns":["NUMBER_OF_OWNERS"]}]'], {
      root: packageRoot,
    });
    await TabsDelete.run([], { root: packageRoot });
    await FiltersList.run([], { root: packageRoot });
    await FiltersSave.run(['--data', '[{"name":"Sweden","filter":{"marketPlaces":["se"]}}]'], {
      root: packageRoot,
    });

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
    expect(JSON.parse(String(fetch.mock.calls[2]![1]?.body))).toEqual({
      tabs: [{ name: 'My tab', columns: ['NUMBER_OF_OWNERS'] }],
    });
    expect(JSON.parse(String(fetch.mock.calls[5]![1]?.body))).toEqual({
      filters: [{ name: 'Sweden', filter: { marketPlaces: ['se'] } }],
    });
  });
});
