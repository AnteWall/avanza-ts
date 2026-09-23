import { expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError } from '../errors.js';
import { expectFixtureReplay, jsonResponse } from '../test-utils/http.js';

const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' } as const;

it('requires a session', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
  await expect(client.orders.orderCount()).rejects.toBeInstanceOf(
    AvanzaAuthenticationRequiredError,
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('sends only GET requests with encoded IDs and filters', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => jsonResponse({}));
  const { orders } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });
  const calls = [
    [() => orders.activeOrderIds(), '/_api/trading/rest/activeorderids'],
    [() => orders.orderCount(), '/_api/trading/rest/ordercount'],
    [() => orders.bulkOrders(), '/_api/trading/bulk/order/fetch'],
    [
      () => orders.bulkOrders({ accountId: 'a', side: 'BUY' }),
      '/_api/trading/bulk/order/fetch?accountId=a&side=BUY',
    ],
    [() => orders.bulkOrder('b/1'), '/_api/trading/bulk/order/fetch/b%2F1'],
    [() => orders.stopLosses(), '/_api/trading/stoploss'],
    [
      () => orders.stopLosses({ accountId: 'a', orderbookId: '5269' }),
      '/_api/trading/stoploss?accountId=a&orderbookId=5269',
    ],
    [() => orders.stopLoss('a', 'A2^1'), '/_api/trading/stoploss/a/A2%5E1'],
    [() => orders.orderbook('5269'), '/_api/trading-critical/rest/orderbook/5269'],
    [() => orders.exchangeRates(), '/_api/trading/rest/exchangerates'],
    [
      () => orders.marketStatus('SE', '2026-09-23'),
      '/_api/trading/rest/trading-calendar/market-status/SE/2026-09-23',
    ],
  ] as const;
  await Promise.all(calls.map(([call]) => call()));
  expect(
    fetch.mock.calls.map(([url, init]) => {
      const { pathname, search } = new URL(url.toString());
      return [pathname + search, init?.method];
    }),
  ).toEqual(calls.map(([, path]) => [path, 'GET']));
});

it.each<[string, (client: AvanzaClient) => Promise<unknown>]>([
  ['orderbook', (c) => c.orders.orderbook('5269')],
  ['exchange-rates', (c) => c.orders.exchangeRates()],
  ['market-status', (c) => c.orders.marketStatus('SE', '2026-09-23')],
  ['bulk-orders', (c) => c.orders.bulkOrders()],
])('replays a recorded %s response', (name, call) =>
  expectFixtureReplay(`orders/fixtures/${name}.json`, call),
);
