import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import type {
  BrokerTradeSummary,
  ChartPeriod,
  ChartPeriodChange,
  CompanyEvent,
  EtfDetailsResponse,
  EtfResponse,
  HeaderIndicesResponse,
  IndexConstituent,
  InsiderTransactionSummary,
  InstrumentByIsinResponse,
  MarketDataResponse,
  MarketOverview,
  MarketTrade,
  Ohlc,
  OrderDepth,
  OverviewChartResponse,
  PriceChartOptions,
  PriceChartPeriod,
  PriceChartResponse,
  SearchOptions,
  SearchResponse,
  ShortSellingResponse,
  StockQuote,
} from './market-types.js';

type Query = NonNullable<HttpRequest['query']>;

export class MarketClient {
  public constructor(protected readonly context: ClientContext) {}

  public search(
    query: string,
    options: SearchOptions = {},
    signal?: AbortSignal,
  ): Promise<SearchResponse> {
    if (!query.trim()) throw new TypeError('Search query must not be empty.');
    return this.context.http.request<SearchResponse>({
      access: 'optional',
      method: 'POST',
      path: '/_api/search/filtered-search',
      body: {
        query,
        searchFilter: { types: options.types ?? [] },
        pagination: { from: options.from ?? 0, size: options.size },
      },
      signal,
    });
  }

  public instrumentByIsin(isin: string, signal?: AbortSignal): Promise<InstrumentByIsinResponse> {
    return this.get(`/market-guide/instrument/isin${pathId(isin)}`, signal);
  }

  public quote(orderbookId: string, signal?: AbortSignal): Promise<StockQuote> {
    return this.get(`/market-guide/stock${pathId(orderbookId)}/quote`, signal);
  }

  public orderDepth(orderbookId: string, signal?: AbortSignal): Promise<OrderDepth> {
    return this.get(`/market-guide/stock${pathId(orderbookId)}/orderdepth`, signal);
  }

  public trades(orderbookId: string, signal?: AbortSignal): Promise<readonly MarketTrade[]> {
    return this.get(`/market-guide/stock${pathId(orderbookId)}/trades`, signal);
  }

  public brokerTradeSummaries(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<readonly BrokerTradeSummary[]> {
    return this.get(`/market-guide/stock${pathId(orderbookId)}/broker-trade-summaries`, signal);
  }

  public shortSelling(orderbookId: string, signal?: AbortSignal): Promise<ShortSellingResponse> {
    return this.get(`/market-guide/short-selling${pathId(orderbookId)}`, signal);
  }

  /** Requires a session. */
  public marketData(orderbookId: string, signal?: AbortSignal): Promise<MarketDataResponse> {
    return this.context.http.request<MarketDataResponse>({
      access: 'required',
      method: 'GET',
      path: `/_api/trading-critical/rest/marketdata${pathId(orderbookId)}`,
      signal,
    });
  }

  public headerIndices(signal?: AbortSignal): Promise<HeaderIndicesResponse> {
    return this.get('/market-index/header-index', signal);
  }

  public indexConstituents(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<readonly IndexConstituent[]> {
    return this.get(`/market-index${pathId(orderbookId)}/constituents`, signal);
  }

  public etf(orderbookId: string, signal?: AbortSignal): Promise<EtfResponse> {
    return this.get(`/market-etf${pathId(orderbookId)}`, signal);
  }

  public etfDetails(orderbookId: string, signal?: AbortSignal): Promise<EtfDetailsResponse> {
    return this.get(`/market-etf${pathId(orderbookId)}/details`, signal);
  }

  public overviews(signal?: AbortSignal): Promise<readonly MarketOverview[]> {
    return this.get('/market-overview/overviews', signal);
  }

  public overviewChart(
    orderbookId: string,
    period: ChartPeriod,
    signal?: AbortSignal,
  ): Promise<OverviewChartResponse> {
    return this.get(`/market-overview/chart${pathId(orderbookId)}${pathId(period)}`, signal, {
      raw: false,
    });
  }

  public overviewChartPeriods(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<readonly ChartPeriodChange[]> {
    return this.get(`/market-overview/chart/timeperiods${pathId(orderbookId)}`, signal);
  }

  public priceChart(
    orderbookId: string,
    period: PriceChartPeriod,
    options: PriceChartOptions = {},
    signal?: AbortSignal,
  ): Promise<PriceChartResponse> {
    return this.get(`/price-chart/stock${pathId(orderbookId)}`, signal, {
      ...periodQuery(period),
      resolution: options.resolution,
    });
  }

  public companyEvents(
    orderbookId: string,
    period: PriceChartPeriod,
    signal?: AbortSignal,
  ): Promise<readonly CompanyEvent[]> {
    return this.get(
      `/price-chart/stock${pathId(orderbookId)}/company-events`,
      signal,
      periodQuery(period),
    );
  }

  public insiderTransactions(
    orderbookId: string,
    period: PriceChartPeriod,
    signal?: AbortSignal,
  ): Promise<readonly InsiderTransactionSummary[]> {
    return this.get(
      `/price-chart/stock${pathId(orderbookId)}/insider-transactions`,
      signal,
      periodQuery(period),
    );
  }

  /** Returns `points` OHLC points before the period start, used as technical-analysis lookback. */
  public technicalAnalysisPoints(
    orderbookId: string,
    period: PriceChartPeriod,
    points: number,
    options: PriceChartOptions = {},
    signal?: AbortSignal,
  ): Promise<readonly Ohlc[]> {
    if (!Number.isInteger(points) || points < 1) {
      throw new TypeError('Points must be a positive integer.');
    }
    return this.get(`/price-chart/stock${pathId(orderbookId)}/ta/`, signal, {
      ...periodQuery(period),
      resolution: options.resolution,
      ta: points,
    });
  }

  private get<Response>(path: string, signal?: AbortSignal, query: Query = {}): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'optional',
      method: 'GET',
      path: `/_api${path}`,
      query,
      signal,
    });
  }
}

function periodQuery(period: PriceChartPeriod): Query {
  return typeof period === 'string' ? { timePeriod: period } : { from: period.from, to: period.to };
}
