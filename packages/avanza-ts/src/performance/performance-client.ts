import type { ClientContext } from '../internal/client-context.js';
import type {
  AverageCustomerChartResponse,
  InsightsPeriod,
  InsightsReport,
  KeyRatioHistoryOptions,
  KeyRatioHistoryResponse,
  KeyRatiosOptions,
  KeyRatiosResponse,
  OrderbookPerformanceChart,
  PerformanceChartOptions,
  PerformanceChartResponse,
  PerformanceDateRange,
  PerformancePeriod,
  TotalValuesResponse,
  YearBenchmarkIndex,
  YearBenchmarkResponse,
  YearChartResponse,
  YearChartSeries,
  YearSummaryResponse,
  YearTransactionsResponse,
} from './performance-types.js';

export class PerformanceClient {
  public constructor(protected readonly context: ClientContext) {}

  /** Omitted or empty `accountIds` include all accounts. */
  public chart(
    period: PerformancePeriod | PerformanceDateRange,
    options: PerformanceChartOptions = {},
    signal?: AbortSignal,
  ): Promise<PerformanceChartResponse> {
    const common = {
      scrambledAccountIds: accountIds(options.accountIds),
      includeClosedAccounts: options.includeClosedAccounts ?? false,
    };
    return typeof period === 'string'
      ? this.post('/chart/accounts/timeperiod', { timePeriod: period, ...common }, signal)
      : this.post(
          '/chart/accounts/timeperiod_custom',
          { from: period.from, to: period.to, ...common },
          signal,
        );
  }

  /** Omitted or empty `ids` include all accounts. */
  public totalValues(ids?: readonly string[], signal?: AbortSignal): Promise<TotalValuesResponse> {
    return this.post('/total-values', accountIds(ids), signal);
  }

  /** Omitted or empty `accountIds` include all accounts. */
  public insights(
    timePeriod: InsightsPeriod,
    ids?: readonly string[],
    signal?: AbortSignal,
  ): Promise<InsightsReport> {
    return this.context.http.request<InsightsReport>({
      access: 'required',
      method: 'POST',
      path: '/_api/insights-development/insights',
      body: { timePeriod, accountIds: accountIds(ids) },
      signal,
    });
  }

  /** Sharpe ratio, standard deviation, and CAGR. Omitted or empty `accountIds` include all accounts. */
  public keyRatios(
    options: KeyRatiosOptions = {},
    signal?: AbortSignal,
  ): Promise<KeyRatiosResponse> {
    return this.context.http.request<KeyRatiosResponse>({
      access: 'required',
      method: 'POST',
      path: '/_api/account-performance/overview/keyratios',
      query: options.includeClosedAccounts ? { includeClosedAccounts: true } : {},
      body: accountIds(options.accountIds),
      signal,
    });
  }

  /** Omitted or empty `accountIds` include all accounts. */
  public keyRatioHistory(
    options: KeyRatioHistoryOptions = {},
    signal?: AbortSignal,
  ): Promise<KeyRatioHistoryResponse> {
    return this.post(
      '/keyratios/history',
      {
        accountIds: accountIds(options.accountIds),
        includeClosedAccounts: options.includeClosedAccounts ?? false,
        ...(options.fromDate === undefined ? {} : { fromDate: options.fromDate }),
      },
      signal,
    );
  }

  /** Relative development of the average Avanza customer. */
  public averageCustomerChart(
    range: PerformanceDateRange,
    signal?: AbortSignal,
  ): Promise<AverageCustomerChartResponse> {
    return this.postApi('/account-performance-analysis/avanza/average', range, signal);
  }

  /** Relative development of instruments, for comparison with your accounts. */
  public orderbookCharts(
    orderbookIds: readonly string[],
    range: PerformanceDateRange,
    signal?: AbortSignal,
  ): Promise<readonly OrderbookPerformanceChart[]> {
    if (orderbookIds.length === 0 || orderbookIds.some((id) => !id.trim())) {
      throw new TypeError('At least one nonempty orderbook ID is required.');
    }
    return this.postApi(
      '/account-performance-analysis/chart/orderbook',
      { orderbookIds, fromDate: range.from, toDate: range.to },
      signal,
    );
  }

  /** Yearly summary: development, best and worst holdings and days. Omitted `ids` include all accounts. */
  public yearSummary(
    year: number,
    ids?: readonly string[],
    signal?: AbortSignal,
  ): Promise<YearSummaryResponse> {
    return this.postYear('/development/performance', year, ids, signal);
  }

  /** Monthly buy and sell totals for a year. Omitted `ids` include all accounts. */
  public yearTransactions(
    year: number,
    ids?: readonly string[],
    signal?: AbortSignal,
  ): Promise<YearTransactionsResponse> {
    return this.postYear('/transactions', year, ids, signal);
  }

  /** Omitted `ids` include all accounts. */
  public yearChart(
    year: number,
    series: YearChartSeries,
    ids?: readonly string[],
    signal?: AbortSignal,
  ): Promise<YearChartResponse> {
    return this.postYear(`/chart/${series}`, year, ids, signal);
  }

  public yearBenchmark(
    year: number,
    index: YearBenchmarkIndex,
    signal?: AbortSignal,
  ): Promise<YearBenchmarkResponse> {
    return this.context.http.request<YearBenchmarkResponse>({
      access: 'required',
      method: 'GET',
      path: `/_api/yearly-summary/chart/benchmark/${index}`,
      query: { year },
      signal,
    });
  }

  private async postYear<Response>(
    path: string,
    year: number,
    ids: readonly string[] | undefined,
    signal?: AbortSignal,
  ): Promise<Response> {
    const scrambledAccountIds = await accountIdsOrAll(this.context, ids, signal);
    return this.postApi(`/yearly-summary${path}`, { scrambledAccountIds, year }, signal);
  }

  private post<Response>(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    return this.postApi(`/account-performance/overview${path}`, body, signal);
  }

  private postApi<Response>(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method: 'POST',
      path: `/_api${path}`,
      body,
      signal,
    });
  }
}

/**
 * Some portfolio endpoints return empty data for an empty ID list, so omitted
 * IDs resolve to every account, as the web does.
 */
export async function accountIdsOrAll(
  context: ClientContext,
  ids: readonly string[] | undefined,
  signal?: AbortSignal,
): Promise<readonly string[]> {
  if (ids !== undefined && ids.length > 0) return accountIds(ids);
  const response = await context.http.request<{
    readonly scrambledAccountIds: readonly { readonly id: number | string }[];
  }>({ access: 'required', method: 'GET', path: '/_api/yearly-summary/accounts', signal });
  return response.scrambledAccountIds.map(({ id }) => String(id));
}

function accountIds(ids: readonly string[] = []): readonly string[] {
  if (ids.some((id) => !id.trim())) throw new TypeError('Account IDs must not be empty.');
  return ids;
}
