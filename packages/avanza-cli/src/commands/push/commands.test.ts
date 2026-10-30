import { resolve } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteSession: vi.fn(),
  loadSession: vi.fn(),
  saveSession: vi.fn(),
}));
vi.mock('../../services/session/session-store.js', () => mocks);
// Push streams use HTTP/2 unless a fetch is given; route them through the mocked global fetch.
vi.mock('avanza-ts', async (importOriginal) => {
  const original = await importOriginal<typeof import('avanza-ts')>();
  class AvanzaClient extends original.AvanzaClient {
    public constructor(options: import('avanza-ts').AvanzaClientOptions = {}) {
      super({ ...options, fetch: (...args) => globalThis.fetch(...args) });
    }
  }
  return { ...original, AvanzaClient };
});

import Orders from './orders.js';
import Quotes from './quotes.js';

const root = resolve(import.meta.dirname, '../../..');
const session = { mode: 'totp', authenticationSession: 'session', securityToken: 'token' };

afterEach(() => {
  vi.restoreAllMocks();
  mocks.loadSession.mockReset();
});

it('prints each quote as a JSON line until the signal aborts', async () => {
  mocks.loadSession.mockResolvedValue(session);
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
    // Simulate Ctrl-C once the first stream has been read.
    setTimeout(() => process.emit('SIGINT'), 0);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    return new Response('id: 1\nevent: QUOTES\ndata: {"orderbookId":"5247","lastPrice":1}\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  });
  const log = vi.spyOn(Quotes.prototype, 'log').mockImplementation(() => undefined);

  await Quotes.run(['--orderbook-ids', '5269,5247'], { root });

  const [url, init] = fetch.mock.calls[0]!;
  expect(new URL(url.toString()).pathname).toBe('/_push/quote-web-push/');
  expect(JSON.parse(String(init?.body))).toEqual({ orderbookIds: ['5247', '5269'] });
  expect(log.mock.calls).toEqual([['{"orderbookId":"5247","lastPrice":1}']]);
});

it('requires a stored session', async () => {
  mocks.loadSession.mockResolvedValue(undefined);
  const fetch = vi.spyOn(globalThis, 'fetch');
  vi.spyOn(Orders.prototype, 'logToStderr').mockImplementation(() => undefined);

  await expect(Orders.run([], { root })).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});
