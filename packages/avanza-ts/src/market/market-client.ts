import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import type {
  AnalysisAccess,
  AnalysisFilter,
  AnalysisProvider,
  AnalysisSummaryItem,
  AnalystRecommendations,
  BrokerTradeSummary,
  ChartPeriod,
  ChartPeriodChange,
  CompanyEvent,
  EstimateHistory,
  EtfDetailsResponse,
  EtfResponse,
  FilteredAnalysesResponse,
  HeaderIndicesResponse,
  IndexConstituent,
  InsiderTradesResponse,
  InsiderTransactionSummary,
  InstrumentNewsResponse,
  InstrumentByIsinResponse,
  ListedInstrument,
  ListedInstrumentDetails,
  ListedInstrumentType,
  MarketDataResponse,
  MarketMakerChartResponse,
  MarketplaceStatus,
  MarketOverview,
  MarketTrade,
  MorningstarAnalysisResponse,
  NumberOfOwnersResponse,
  Ohlc,
  OrderDepth,
  OverviewChartResponse,
  PriceChartOptions,
  PriceChartPeriod,
  PriceChartResponse,
  PriceTargets,
  SearchOptions,
  SearchResponse,
  SectorAnalysis,
  ShortSellingResponse,
  StockAnalysis,
  StockEstimates,
  StockInfo,
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

  public stock(orderbookId: string, signal?: AbortSignal): Promise<StockInfo> {
    return this.get(`/market-guide/stock${pathId(orderbookId)}`, signal);
  }

  /** Key ratios, financials, and dividends by year and quarter. */
  public stockAnalysis(orderbookId: string, signal?: AbortSignal): Promise<StockAnalysis> {
    return this.get(`/market-guide/stock${pathId(orderbookId)}/analysis`, signal);
  }

  public marketplace(orderbookId: string, signal?: AbortSignal): Promise<MarketplaceStatus> {
    return this.get(`/market-guide/stock${pathId(orderbookId)}/marketplace`, signal);
  }

  /** History of how many Avanza customers own the instrument. */
  public numberOfOwners(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<NumberOfOwnersResponse> {
    return this.get(`/market-guide/number-of-owners${pathId(orderbookId)}`, signal);
  }

  public instrument(
    type: ListedInstrumentType,
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<ListedInstrument> {
    return this.get(`/market-guide${pathId(type)}${pathId(orderbookId)}`, signal);
  }

  /** Issuer, documents, order depth, and trades for a listed product. */
  public instrumentDetails(
    type: ListedInstrumentType,
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<ListedInstrumentDetails> {
    return this.get(`/market-guide${pathId(type)}${pathId(orderbookId)}/details`, signal);
  }

  public news(orderbookId: string, signal?: AbortSignal): Promise<InstrumentNewsResponse> {
    return this.get(`/market-guide/news${pathId(orderbookId)}`, signal);
  }

  /** Individual insider transactions with the reporting insider. */
  public insiderTrades(orderbookId: string, signal?: AbortSignal): Promise<InsiderTradesResponse> {
    return this.get(`/market-insider-transactions/transactions${pathId(orderbookId)}`, signal);
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
    return this.getAuthenticated(`/trading-critical/rest/marketdata${pathId(orderbookId)}`, signal);
  }

  /** Key ratios, financials, and dividends with analyst estimates. Requires a session. */
  public stockEstimates(orderbookId: string, signal?: AbortSignal): Promise<StockEstimates> {
    return this.getAuthenticated(`/market-stock-analysis/analysis${pathId(orderbookId)}`, signal);
  }

  /** Key ratios for the stock's sector. */
  public sectorAnalysis(orderbookId: string, signal?: AbortSignal): Promise<SectorAnalysis> {
    return this.get(`/market-stock-analysis/analysis${pathId(orderbookId)}/sector`, signal);
  }

  /** Current analyst recommendation counts and consensus. Requires a session. */
  public analystRecommendations(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<AnalystRecommendations> {
    return this.getAuthenticated(
      `/market-stock-analysis/estimate/recommendation${pathId(orderbookId)}`,
      signal,
    );
  }

  /** Current analyst price targets. Requires a session. */
  public priceTargets(orderbookId: string, signal?: AbortSignal): Promise<PriceTargets> {
    return this.getAuthenticated(
      `/market-stock-analysis/estimate/pricetarget${pathId(orderbookId)}`,
      signal,
    );
  }

  /** Past recommendations and price targets. Requires a session. */
  public estimateHistory(orderbookId: string, signal?: AbortSignal): Promise<EstimateHistory> {
    return this.getAuthenticated(
      `/market-stock-analysis/estimate/history${pathId(orderbookId)}`,
      signal,
    );
  }

  /** Morningstar fair value, moat, and bull/bear case. Requires a session. */
  public morningstarAnalysis(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<MorningstarAnalysisResponse> {
    return this.getAuthenticated(`/stock-analyses${pathId(orderbookId)}`, signal);
  }

  /** Which gated analysis providers the customer can read. Requires a session. */
  public analysisAccess(signal?: AbortSignal): Promise<AnalysisAccess> {
    return this.getAuthenticated('/market-external-analysis/external-analysis/access', signal);
  }

  /** Latest analyses from a provider. Requires a session. */
  public latestAnalyses(
    provider: AnalysisProvider,
    signal?: AbortSignal,
  ): Promise<readonly AnalysisSummaryItem[]> {
    return this.getAuthenticated(
      `/market-external-analysis/latest-analysis-summary${pathId(provider)}`,
      signal,
    );
  }

  /** Latest analysis of one stock, or `undefined` when there is none. Requires a session. */
  public latestAnalysis(
    provider: AnalysisProvider,
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<AnalysisSummaryItem | undefined> {
    return this.getAuthenticated(
      `/market-external-analysis/latest-analysis-summary${pathId(provider)}${pathId(orderbookId)}`,
      signal,
    );
  }

  /** Filters a provider's analyses, newest first. Requires a session. */
  public filterAnalyses(
    provider: AnalysisProvider,
    filter: AnalysisFilter = {},
    signal?: AbortSignal,
  ): Promise<FilteredAnalysesResponse> {
    const lists = [
      ['sectors', filter.sectors],
      ['countryMarketList', filter.countryMarkets],
    ] as const;
    return this.context.http.request<FilteredAnalysesResponse>({
      access: 'required',
      method: 'POST',
      path: '/_api/market-external-analysis/filtered-analyses',
      body: {
        provider: provider.toUpperCase(),
        dateFilter: {},
        recommendationFilter: filter.recommendations?.length
          ? { filterField: 'recommendation', values: filter.recommendations }
          : {},
        stringListFilters: lists
          .filter(([, values]) => values?.length)
          .map(([filterField, values]) => ({ filterField, values })),
        stringQueryFilters: filter.name ? [{ filterField: 'name', query: filter.name }] : [],
        offset: filter.offset ?? 0,
        limit: filter.limit ?? 20,
        sortBy: { field: 'publishDate', order: 'desc' },
      },
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

  /** Price chart with market maker bid and ask, for certificates and warrants. */
  public marketMakerChart(
    orderbookId: string,
    period: PriceChartPeriod,
    options: PriceChartOptions = {},
    signal?: AbortSignal,
  ): Promise<MarketMakerChartResponse> {
    return this.get(`/price-chart/marketmaker${pathId(orderbookId)}`, signal, {
      ...periodQuery(period),
      resolution: options.resolution,
    });
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

  private getAuthenticated<Response>(path: string, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method: 'GET',
      path: `/_api${path}`,
      signal,
    });
  }
}

function periodQuery(period: PriceChartPeriod): Query {
  return typeof period === 'string' ? { timePeriod: period } : { from: period.from, to: period.to };
}
