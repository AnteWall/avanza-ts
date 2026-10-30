import { AvanzaError, AvanzaHttpError } from '../errors.js';
import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import type {
  PushEvent,
  PushOrderDepth,
  PushQuote,
  PushSubscribeOptions,
  PushTrade,
  PushTradingOptions,
} from './push-types.js';

// Delays match avanza.se's SseService: quick retry after a closed stream or 5xx, slower after network errors.
const CLOSED_RETRY_MS = 500;
const ERROR_RETRY_MS = 3_000;
const MAX_SEEN_IDS = 10_000;

interface PushSource {
  readonly body?: { readonly orderbookIds: readonly string[] };
  readonly path: string;
  readonly query?: HttpRequest['query'];
  readonly type: string;
}

interface ServerSentEvent {
  readonly data: string;
  readonly event: string;
  readonly id: string | undefined;
}

/** Live data from Avanza's Server-Sent Events endpoints under `/_push`. Requires a session. */
export class PushClient {
  public constructor(protected readonly context: ClientContext) {}

  public quote(orderbookId: string, options?: PushSubscribeOptions): AsyncGenerator<PushQuote> {
    return this.#subscribe(
      { path: `/_push/quote-web-push${pathId(orderbookId)}`, type: 'QUOTE' },
      options,
    );
  }

  public quotes(
    orderbookIds: readonly string[],
    options?: PushSubscribeOptions,
  ): AsyncGenerator<PushQuote> {
    return this.#subscribe(
      { body: idsBody(orderbookIds), path: '/_push/quote-web-push/', type: 'QUOTES' },
      options,
    );
  }

  public orderDepth(
    orderbookId: string,
    options?: PushSubscribeOptions,
  ): AsyncGenerator<PushOrderDepth> {
    return this.#subscribe(
      { path: `/_push/order-depth-web-push${pathId(orderbookId)}`, type: 'ORDER_DEPTH' },
      options,
    );
  }

  public orderDepths(
    orderbookIds: readonly string[],
    options?: PushSubscribeOptions,
  ): AsyncGenerator<PushOrderDepth> {
    return this.#subscribe(
      { body: idsBody(orderbookIds), path: '/_push/order-depth-web-push/', type: 'ORDER_DEPTHS' },
      options,
    );
  }

  public trades(orderbookId: string, options?: PushSubscribeOptions): AsyncGenerator<PushTrade> {
    return this.#subscribe(
      { path: `/_push/trade-web-push${pathId(orderbookId)}`, type: 'TRADE' },
      options,
    );
  }

  public tradeState(
    orderbookId: string,
    options?: PushSubscribeOptions,
  ): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      { path: `/_push/trade-state-web-push${pathId(orderbookId)}`, type: 'TRADE_STATE' },
      options,
    );
  }

  public warrantLeverage(
    orderbookId: string,
    options?: PushSubscribeOptions,
  ): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      { path: `/_push/warrant-leverage-web-push${pathId(orderbookId)}`, type: 'WARRANT_LEVERAGE' },
      options,
    );
  }

  public offhoursQuote(
    orderbookId: string,
    options?: PushSubscribeOptions,
  ): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      { path: `/_push/market-offhours-price${pathId(orderbookId)}`, type: 'OFFHOURS_QUOTE' },
      options,
    );
  }

  public offhoursQuotes(
    orderbookIds: readonly string[],
    options?: PushSubscribeOptions,
  ): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      {
        body: idsBody(orderbookIds),
        path: '/_push/market-offhours-price/',
        type: 'OFFHOURS_QUOTES',
      },
      options,
    );
  }

  public deals(options: PushTradingOptions = {}): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      { path: '/_push/trading/deals', query: { orderbookId: options.orderbookId }, type: 'DEAL' },
      options,
    );
  }

  public orders(options: PushTradingOptions = {}): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      {
        path: '/_push/trading/orders/',
        query: { orderbookId: options.orderbookId },
        type: 'ORDER',
      },
      options,
    );
  }

  public stopLosses(options: PushTradingOptions = {}): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      {
        path: '/_push/trading/stoploss/',
        query: { orderbookId: options.orderbookId },
        type: 'STOPLOSS',
      },
      options,
    );
  }

  public currencyDeals(options?: PushSubscribeOptions): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      { path: '/_push/trading/currency-deals', type: 'CURRENCY_DEAL' },
      options,
    );
  }

  public currencyOrders(options?: PushSubscribeOptions): AsyncGenerator<PushEvent> {
    return this.#subscribe(
      { path: '/_push/trading/orders/currency-orders', type: 'CURRENCY_ORDER' },
      options,
    );
  }

  async *#subscribe<Event>(
    source: PushSource,
    options: PushSubscribeOptions = {},
  ): AsyncGenerator<Event> {
    const { signal } = options;
    const seen = new Set<string>();
    let lastEventId: string | undefined;
    // A function call so TypeScript does not keep `aborted` narrowed across awaits.
    const aborted = (): boolean => signal?.aborted === true;

    /* oxlint-disable no-await-in-loop -- one connection at a time; reconnects must be sequential */

    while (!aborted()) {
      let delay = CLOSED_RETRY_MS;
      try {
        const response = await this.context.http.stream({
          access: 'required',
          body: source.body,
          headers: {
            Accept: 'text/event-stream',
            'AZA-Do-Not-Touch-Session': 'true',
            ...(lastEventId === undefined ? {} : { 'Last-Event-ID': lastEventId }),
          },
          method: source.body === undefined ? 'GET' : 'POST',
          path: source.path,
          ...(source.query === undefined ? {} : { query: source.query }),
          signal,
        });

        if (response.headers.get('Content-Type')?.startsWith('text/event-stream') !== true) {
          // The web app treats this like a dropped connection and reconnects.
          await response.body?.cancel();
        } else {
          for await (const message of parseEventStream(response.body)) {
            if (message.id !== undefined) lastEventId = message.id;
            if (message.event !== source.type) continue;
            if (message.id !== undefined) {
              if (seen.has(message.id)) continue;
              seen.add(message.id);
              // Sets keep insertion order, so this drops the oldest id.
              if (seen.size > MAX_SEEN_IDS) seen.delete(seen.values().next().value!);
            }
            yield JSON.parse(message.data) as Event;
          }
        }
      } catch (error) {
        if (aborted()) return;
        const serverError = error instanceof AvanzaHttpError && error.status >= 500;
        // 4xx, missing session and malformed JSON are not fixed by reconnecting.
        if (error instanceof SyntaxError || (error instanceof AvanzaError && !serverError)) {
          throw error;
        }
        if (!serverError) delay = ERROR_RETRY_MS;
      }
      await sleep(delay, signal);
    }
    /* oxlint-enable no-await-in-loop */
  }
}

function idsBody(orderbookIds: readonly string[]): { readonly orderbookIds: readonly string[] } {
  if (orderbookIds.length === 0) throw new TypeError('At least one orderbook ID is required.');
  // oxlint-disable-next-line no-array-sort -- sorts a copy; toSorted is not in the ES2022 lib
  return { orderbookIds: [...orderbookIds].sort() };
}

async function* parseEventStream(
  body: ReadableStream<Uint8Array> | null,
): AsyncGenerator<ServerSentEvent> {
  if (body === null) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let data: string[] = [];
  let event = '';
  let id: string | undefined;

  try {
    /* oxlint-disable no-await-in-loop -- stream chunks arrive in order */
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      // shortcut: lines end in \n or \r\n only; add bare \r if Avanza ever sends it.
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
        if (line === '') {
          if (data.length > 0) yield { data: data.join('\n'), event: event || 'message', id };
          data = [];
          event = '';
          // Per message like fetch-event-source, so events without an id are never de-duplicated.
          id = undefined;
          continue;
        }
        if (line.startsWith(':')) continue;
        const colon = line.indexOf(':');
        const field = colon === -1 ? line : line.slice(0, colon);
        const content = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');
        if (field === 'data') data.push(content);
        else if (field === 'event') event = content;
        else if (field === 'id' && !content.includes('\0')) id = content;
      }
    }
    /* oxlint-enable no-await-in-loop */
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

function sleep(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(done, ms);
    signal?.addEventListener('abort', done, { once: true });
    function done(): void {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    }
  });
}
