import type { ClientContext } from '../internal/client-context.js';
import type { HttpMethod, HttpRequest } from '../internal/http-types.js';
import type {
  Alert,
  AlertsResponse,
  Note,
  NoteOrderbook,
  Watchlist,
  WatchlistDataPoint,
  WatchlistNewsOptions,
  WatchlistNewsResponse,
  WatchlistRow,
} from './collections-types.js';

/** Read-only watchlists, alerts, and instrument notes. All require a session. */
export class CollectionsClient {
  public constructor(protected readonly context: ClientContext) {}

  public watchlists(signal?: AbortSignal): Promise<readonly Watchlist[]> {
    return this.request('GET', '/watchlist/watchlist', signal);
  }

  /** Queries rows for `orderbookIds` in a watchlist; `dataPoints` select the returned fields. */
  public watchlistData(
    watchListId: string,
    orderbookIds: readonly string[],
    dataPoints: readonly WatchlistDataPoint[] = ['LAST_PRICE'],
    signal?: AbortSignal,
  ): Promise<readonly WatchlistRow[]> {
    if (orderbookIds.length === 0) throw new TypeError('Orderbook IDs must not be empty.');
    return this.request('POST', '/watchlist/data/by-id', signal, {
      body: { watchListId, orderbookIds, orderbookDataPoints: dataPoints },
    });
  }

  public watchlistNews(
    orderbookIds: readonly string[],
    options: WatchlistNewsOptions = {},
    signal?: AbortSignal,
  ): Promise<WatchlistNewsResponse> {
    if (orderbookIds.length === 0) throw new TypeError('Orderbook IDs must not be empty.');
    return this.request('POST', '/watchlist/news', signal, {
      body: { orderbookIds, categories: options.categories },
    });
  }

  public alerts(signal?: AbortSignal): Promise<AlertsResponse> {
    return this.request('GET', '/alert/alerts', signal);
  }

  public triggeredAlerts(signal?: AbortSignal): Promise<readonly Alert[]> {
    return this.request('GET', '/alert/alerts/triggered-alerts', signal);
  }

  public notes(orderbookId?: string, signal?: AbortSignal): Promise<readonly Note[]> {
    return this.request('GET', '/user-note/', signal, { query: { orderbookId } });
  }

  /** Orderbooks that have at least one note. */
  public noteOrderbooks(signal?: AbortSignal): Promise<readonly NoteOrderbook[]> {
    return this.request('GET', '/user-note/available-orderbooks', signal);
  }

  private request<Response>(
    method: HttpMethod,
    path: string,
    signal?: AbortSignal,
    options: Pick<HttpRequest, 'body' | 'query'> = {},
  ): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method,
      path: `/_api${path}`,
      ...options,
      signal,
    });
  }
}
