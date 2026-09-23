import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import type { ChartPeriod, ChartPeriodChange } from '../market/market-types.js';
import type {
  FundChartResponse,
  FundDescription,
  FundDevelopment,
  FundGuide,
  FundInstrumentSearchResponse,
  FundListOptions,
  FundListResponse,
  FundOrderbook,
  FundOrderbookDetails,
  FundPieChartPoint,
  FundPortfolioData,
  FundReference,
  FundSearchResponse,
  FundSustainability,
  FundTopTenOptions,
  FundTopTenResponse,
} from './funds-types.js';

type Query = NonNullable<HttpRequest['query']>;

export class FundsClient {
  public constructor(protected readonly context: ClientContext) {}

  public search(name: string, signal?: AbortSignal): Promise<FundSearchResponse> {
    if (!name.trim()) throw new TypeError('Fund name must not be empty.');
    return this.post('/fund-guide/search', { name }, signal);
  }

  public list(options: FundListOptions = {}, signal?: AbortSignal): Promise<FundListResponse> {
    return this.post(
      '/fund-guide/list',
      {
        ...options.filter,
        name: options.name ?? '',
        sortField: options.sortField ?? 'developmentThreeYears',
        sortDirection: options.sortDirection ?? 'DESCENDING',
        startIndex: options.startIndex ?? 0,
        maxNoResults: options.maxNoResults ?? 20,
      },
      signal,
    );
  }

  public instrumentSearch(
    query: string,
    signal?: AbortSignal,
  ): Promise<FundInstrumentSearchResponse> {
    if (!query.trim()) throw new TypeError('Search query must not be empty.');
    return this.get('/fund-guide/instrument-search', signal, { query });
  }

  public topTen(
    options: FundTopTenOptions = {},
    signal?: AbortSignal,
  ): Promise<FundTopTenResponse> {
    return this.get('/fund-guide/top-ten', signal, {
      sortField: options.sortField,
      sortDirection: options.sortDirection,
      fundInstrumentType: options.fundInstrumentType ?? 'FUND',
    });
  }

  public guide(orderbookId: string, signal?: AbortSignal): Promise<FundGuide> {
    return this.get(`/fund-guide/guide${pathId(orderbookId)}`, signal);
  }

  public description(orderbookId: string, signal?: AbortSignal): Promise<FundDescription> {
    return this.get(`/fund-guide/description${pathId(orderbookId)}`, signal);
  }

  public orderbook(orderbookId: string, signal?: AbortSignal): Promise<FundOrderbook> {
    return this.get(`/fund-guide/fund-orderbook${pathId(orderbookId)}`, signal);
  }

  public details(orderbookId: string, signal?: AbortSignal): Promise<FundOrderbookDetails> {
    return this.get(`/fund-guide/fund-orderbook/details${pathId(orderbookId)}`, signal);
  }

  public holdings(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<readonly FundPieChartPoint[]> {
    return this.get(`/fund-guide/fund-orderbook/piechart/holdings${pathId(orderbookId)}`, signal);
  }

  public regions(orderbookId: string, signal?: AbortSignal): Promise<readonly FundPieChartPoint[]> {
    return this.get(`/fund-guide/fund-orderbook/piechart/regions${pathId(orderbookId)}`, signal);
  }

  public sectors(orderbookId: string, signal?: AbortSignal): Promise<readonly FundPieChartPoint[]> {
    return this.get(`/fund-guide/fund-orderbook/piechart/sectors${pathId(orderbookId)}`, signal);
  }

  public chart(
    orderbookId: string,
    period: ChartPeriod,
    signal?: AbortSignal,
  ): Promise<FundChartResponse> {
    return this.get(`/fund-guide/chart${pathId(orderbookId)}${pathId(period)}`, signal);
  }

  public chartPeriods(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<readonly ChartPeriodChange[]> {
    return this.get(`/fund-guide/chart/timeperiods${pathId(orderbookId)}`, signal);
  }

  public reference(orderbookId: string, signal?: AbortSignal): Promise<FundReference> {
    return this.get(`/fund-reference/reference${pathId(orderbookId)}`, signal);
  }

  public development(orderbookId: string, signal?: AbortSignal): Promise<FundDevelopment> {
    return this.get(`/fund-reference/development${pathId(orderbookId)}`, signal);
  }

  public portfolioData(orderbookId: string, signal?: AbortSignal): Promise<FundPortfolioData> {
    return this.get(`/fund-reference/portfolio-data${pathId(orderbookId)}`, signal);
  }

  public sustainability(orderbookId: string, signal?: AbortSignal): Promise<FundSustainability> {
    return this.get(`/fund-reference/sustainability${pathId(orderbookId)}`, signal);
  }

  /** Requires a session. The item shape is unverified; captures so far were empty. */
  public favourites(signal?: AbortSignal): Promise<readonly unknown[]> {
    return this.get('/fund-guide/get-favourites', signal, {}, 'required');
  }

  /** Requires a session. */
  public isFavourite(orderbookId: string, signal?: AbortSignal): Promise<boolean> {
    return this.get(`/fund-guide/is-favourite${pathId(orderbookId)}`, signal, {}, 'required');
  }

  private get<Response>(
    path: string,
    signal?: AbortSignal,
    query: Query = {},
    access: HttpRequest['access'] = 'optional',
  ): Promise<Response> {
    return this.context.http.request<Response>({
      access,
      method: 'GET',
      path: `/_api${path}`,
      query,
      signal,
    });
  }

  private post<Response>(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'optional',
      method: 'POST',
      path: `/_api${path}`,
      body,
      signal,
    });
  }
}
