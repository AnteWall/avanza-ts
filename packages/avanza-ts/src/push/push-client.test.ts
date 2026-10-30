import { expect, it, vi } from 'vitest';

import { AvanzaClient } from '../client.js';
import { AvanzaAuthenticationRequiredError, AvanzaHttpError } from '../errors.js';
import { jsonResponse } from '../test-utils/http.js';

const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' } as const;

function sseResponse(...chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream;charset=UTF-8' } });
}

async function take<Value>(iterator: AsyncIterable<Value>, count: number): Promise<Value[]> {
  const values: Value[] = [];
  for await (const value of iterator) {
    values.push(value);
    if (values.length === count) break;
  }
  return values;
}

it('requires a session', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch });
  await expect(take(client.push.quote('5247'), 1)).rejects.toBeInstanceOf(
    AvanzaAuthenticationRequiredError,
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('posts sorted orderbook IDs and parses split, filtered and repeated events', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(
      sseResponse(
        ': keep-alive\r\n\r\n',
        'event: OTHER\ndata: {"orderbookId":"0"}\n\n',
        'id: 1\nevent: QUOTES\ndata: {"orderbookId":',
        '"5247",\ndata: "lastPrice":1}\n\n',
        'id: 1\nevent: QUOTES\ndata: {"orderbookId":"dup"}\n\n',
        'id: 2\r\nevent: QUOTES\r\ndata: {"orderbookId":"5269"}\r\n\r\n',
      ),
    );
  const client = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });

  await expect(take(client.push.quotes(['5269', '5247']), 2)).resolves.toEqual([
    { orderbookId: '5247', lastPrice: 1 },
    { orderbookId: '5269' },
  ]);

  const [url, init] = fetch.mock.calls[0]!;
  const headers = new Headers(init?.headers);
  expect(new URL(url.toString()).pathname).toBe('/_push/quote-web-push/');
  expect(init?.method).toBe('POST');
  expect(JSON.parse(String(init?.body))).toEqual({ orderbookIds: ['5247', '5269'] });
  expect(headers.get('Accept')).toBe('text/event-stream');
  expect(headers.get('AZA-Do-Not-Touch-Session')).toBe('true');
  expect(headers.get('X-SecurityToken')).toBe('token');
});

it('skips the info handshake and heartbeats Avanza sends', async () => {
  // Shape captured from avanza.se: no space after the colon, comment and event heartbeats.
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(
      sseResponse(
        'event:info\ndata:connected\nid:AbCdEfGhIjKlMnOpQrStUvWxY\nretry:1000\n\n',
        ':heartbeat\n\nevent:heartbeat\n\n',
        'event:QUOTE\ndata:{"orderbookId":"5247"}\n\n',
      ),
    );
  const { push } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });

  await expect(take(push.quote('5247'), 1)).resolves.toEqual([{ orderbookId: '5247' }]);
});

it('builds GET paths for single-orderbook and trading streams', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (url) => {
    const type = new URL(url.toString()).pathname;
    return sseResponse(`event: ${eventTypes[type] ?? ''}\ndata: {}\n\n`);
  });
  const eventTypes: Record<string, string> = {
    '/_push/order-depth-web-push/5247': 'ORDER_DEPTH',
    '/_push/trade-web-push/5247': 'TRADE',
    '/_push/trade-state-web-push/5247': 'TRADE_STATE',
    '/_push/trading/orders/': 'ORDER',
  };
  const { push } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });

  await take(push.orderDepth('5247'), 1);
  await take(push.trades('5247'), 1);
  await take(push.tradeState('5247'), 1);
  await take(push.orders({ orderbookId: '5247' }), 1);

  expect(
    fetch.mock.calls.map(([url, init]) => {
      const { pathname, search } = new URL(url.toString());
      return [pathname + search, init?.method];
    }),
  ).toEqual([
    ['/_push/order-depth-web-push/5247', 'GET'],
    ['/_push/trade-web-push/5247', 'GET'],
    ['/_push/trade-state-web-push/5247', 'GET'],
    ['/_push/trading/orders/?orderbookId=5247', 'GET'],
  ]);
});

it('reconnects with the last event id after the stream closes', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(sseResponse('id: 7\nevent: QUOTE\ndata: {"n":1}\n\n'))
    .mockResolvedValueOnce(sseResponse('id: 8\nevent: QUOTE\ndata: {"n":2}\n\n'));
  const { push } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });

  await expect(take(push.quote('5247'), 2)).resolves.toEqual([{ n: 1 }, { n: 2 }]);
  expect(new Headers(fetch.mock.calls[1]![1]?.headers).get('Last-Event-ID')).toBe('7');
});

it('stops without retrying on a client error', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(jsonResponse({}, { status: 401 }));
  const { push } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });

  await expect(take(push.quote('5247'), 1)).rejects.toBeInstanceOf(AvanzaHttpError);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('ends when the signal aborts while waiting to reconnect', async () => {
  const controller = new AbortController();
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => {
    setTimeout(() => controller.abort(), 0);
    return sseResponse();
  });
  const { push } = new AvanzaClient({ baseUrl: 'https://example.test', fetch, session });

  await expect(take(push.quote('5247', { signal: controller.signal }), 1)).resolves.toEqual([]);
  expect(fetch).toHaveBeenCalledTimes(1);
});
