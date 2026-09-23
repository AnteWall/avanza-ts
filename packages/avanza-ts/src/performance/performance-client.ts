import type { ClientContext } from '../internal/client-context.js';
import type {
  PerformanceChartOptions,
  PerformanceChartResponse,
  PerformanceDateRange,
  PerformancePeriod,
  TotalValuesResponse,
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

  private post<Response>(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method: 'POST',
      path: `/_api/account-performance/overview${path}`,
      body,
      signal,
    });
  }
}

function accountIds(ids: readonly string[] = []): readonly string[] {
  if (ids.some((id) => !id.trim())) throw new TypeError('Account IDs must not be empty.');
  return ids;
}
