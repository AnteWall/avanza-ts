import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import type {
  BulkOrder,
  BulkOrderOptions,
  BulkOrdersResponse,
  DealsResponse,
  ExchangeRate,
  MarketStatus,
  OrderCount,
  OrdersResponse,
  StopLoss,
  StopLossOptions,
  TradingOrderbook,
} from './orders-types.js';

/** Read-only order and trading status endpoints. All require a session. */
export class OrdersClient {
  public constructor(protected readonly context: ClientContext) {}

  /** Open, fund, and cancelled orders. */
  public orders(signal?: AbortSignal): Promise<OrdersResponse> {
    return this.get('/trading/rest/orders', signal);
  }

  /** Today's executed deals, including fund deals. */
  public deals(signal?: AbortSignal): Promise<DealsResponse> {
    return this.get('/trading/rest/deals', signal);
  }

  public activeOrderIds(signal?: AbortSignal): Promise<readonly string[]> {
    return this.get('/trading/rest/activeorderids', signal);
  }

  public orderCount(signal?: AbortSignal): Promise<OrderCount> {
    return this.get('/trading/rest/ordercount', signal);
  }

  /** Saved bulk (multi-instrument) orders. */
  public bulkOrders(
    options: BulkOrderOptions = {},
    signal?: AbortSignal,
  ): Promise<BulkOrdersResponse> {
    return this.get('/trading/bulk/order/fetch', signal, { ...options });
  }

  public bulkOrder(bulkOrderId: string, signal?: AbortSignal): Promise<BulkOrder> {
    return this.get(`/trading/bulk/order/fetch${pathId(bulkOrderId)}`, signal);
  }

  public stopLosses(
    options: StopLossOptions = {},
    signal?: AbortSignal,
  ): Promise<readonly StopLoss[]> {
    return this.get('/trading/stoploss', signal, { ...options });
  }

  /** `accountId` is an account URL parameter ID. */
  public stopLoss(accountId: string, stopLossId: string, signal?: AbortSignal): Promise<StopLoss> {
    return this.get(`/trading/stoploss${pathId(accountId)}${pathId(stopLossId)}`, signal);
  }

  /** Trading rules for an orderbook: tick sizes, validity range, and supported order features. */
  public orderbook(orderbookId: string, signal?: AbortSignal): Promise<TradingOrderbook> {
    return this.get(`/trading-critical/rest/orderbook${pathId(orderbookId)}`, signal);
  }

  public exchangeRates(signal?: AbortSignal): Promise<readonly ExchangeRate[]> {
    return this.get('/trading/rest/exchangerates', signal);
  }

  /** `countryCode` is for example `SE` or `US`; `date` is `yyyy-MM-dd` and defaults to today (UTC). */
  public marketStatus(
    countryCode: string,
    date = new Date().toISOString().slice(0, 10),
    signal?: AbortSignal,
  ): Promise<MarketStatus> {
    return this.get(
      `/trading/rest/trading-calendar/market-status${pathId(countryCode)}${pathId(date)}`,
      signal,
    );
  }

  private get<Response>(
    path: string,
    signal?: AbortSignal,
    query: NonNullable<HttpRequest['query']> = {},
  ): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method: 'GET',
      path: `/_api${path}`,
      query,
      signal,
    });
  }
}
