import { describe, expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { httpFixtureResponse, jsonResponse, loadHttpFixture } from '../test-utils/http.js';

describe('PositionsClient read-only endpoints', () => {
  it('requires a session for position requests', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
    await expect(client.positions.list()).rejects.toBeInstanceOf(AvanzaAuthenticationRequiredError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('routes all six requests using GET with encoded IDs and query parameters', async () => {
    const response = {
      withOrderbook: [],
      withoutOrderbook: [],
      cashPositions: [],
      withCreditAccount: false,
    };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async () => jsonResponse(response));
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        mode: 'totp',
        authenticationSession: 'session',
        securityToken: 'token',
      },
    });
    const calls = [
      [() => client.positions.list(), '/_api/position-data/positions'],
      [() => client.positions.list('a/b'), '/_api/position-data/positions/a%2Fb'],
      [() => client.positions.countries('a/b'), '/_api/position-data/country/list/a%2Fb'],
      [() => client.positions.activeTools(), '/_api/position-data/tools/active'],
      [
        () => client.positions.orderbooks(['123', '456']),
        '/_api/position-data/orderbooks?orderbookIds=123&orderbookIds=456',
      ],
      [
        () => client.positions.categories('123'),
        '/_api/position-statistics/statistics/categories/123',
      ],
      [
        () => client.positions.popularCategories('123'),
        '/_api/position-statistics/statistics/popular-categories/123',
      ],
    ] as const;
    expect(await Promise.all(calls.map(([call]) => call()))).toEqual(calls.map(() => response));
    expect(
      fetch.mock.calls.map(([url, init]) => [
        new URL(url.toString()).pathname + new URL(url.toString()).search,
        init?.method,
      ]),
    ).toEqual(calls.map(([, path]) => [path, 'GET']));
    expect(fetch.mock.calls.every(([, init]) => init?.body === undefined)).toBe(true);
    expect(() => client.positions.orderbooks([])).toThrow();
    expect(() => client.positions.categories('')).toThrow();
    expect(fetch).toHaveBeenCalledTimes(calls.length);
  });

  it('parses an anonymized account-specific position capture and rejects malformed responses', async () => {
    const fixture = loadHttpFixture('positions/fixtures/positions.json');
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(httpFixtureResponse('positions/fixtures/positions.json'))
      .mockResolvedValueOnce(jsonResponse({ withOrderbook: [] }));
    const client = new AvanzaClient({
      baseUrl: 'https://example.test',
      fetch,
      session: {
        mode: 'totp',
        authenticationSession: 'session',
        securityToken: 'token',
      },
    });

    const positions = await client.positions.list('synthetic-account');
    expect(positions).toEqual(fixture.response.body);
    expect(positions.withOrderbook[0]?.instrument.orderbook?.quote?.latest?.unit).toBe('SEK');
    expect(positions.withoutOrderbook).toEqual([]);
    expect(new URL(fetch.mock.calls[0]![0].toString()).pathname).toBe(fixture.request.path);
    expect(fetch.mock.calls[0]![1]?.method).toBe(fixture.request.method);
    await expect(client.positions.list('synthetic-account')).rejects.toThrow();
  });
});
