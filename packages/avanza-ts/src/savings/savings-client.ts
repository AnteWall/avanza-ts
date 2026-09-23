import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import type {
  CreditAccountsResponse,
  PensionDetails,
  PensionDistribution,
  PeriodicSavingsResponse,
  RecurringDepositsResponse,
  SavingsCategory,
  SavingsGoalHealth,
  SavingsGoalPerformance,
  SavingsGoalPeriod,
  UnverifiedItem,
} from './savings-types.js';

/** Read-only recurring savings, savings goals, credit, and pension data. All require a session. */
export class SavingsClient {
  public constructor(protected readonly context: ClientContext) {}

  public periodicSavings(signal?: AbortSignal): Promise<PeriodicSavingsResponse> {
    return this.get('/periodic-fund-saving/get-periodic-savings', signal);
  }

  public recurringDeposits(signal?: AbortSignal): Promise<RecurringDepositsResponse> {
    return this.get('/recurring-deposit/get-recurring-deposits', signal);
  }

  /** Accounts grouped into savings goals and other categories. */
  public categories(signal?: AbortSignal): Promise<readonly SavingsCategory[]> {
    return this.get('/savings-goals/savings-category/get-accounts-categorized', signal);
  }

  public goalHealth(categoryId: string, signal?: AbortSignal): Promise<SavingsGoalHealth> {
    return this.get(`/savings-goals/insights/get-goal-health-status${pathId(categoryId)}`, signal);
  }

  public goalPerformance(
    categoryId: string,
    timePeriod: SavingsGoalPeriod,
    signal?: AbortSignal,
  ): Promise<SavingsGoalPerformance> {
    return this.get(
      `/savings-goals/insights/get-goal-performance-time-series${pathId(categoryId)}`,
      signal,
      { timePeriod },
    );
  }

  /** Accounts available for securities credit. */
  public creditAccounts(signal?: AbortSignal): Promise<CreditAccountsResponse> {
    return this.get('/superloan/analysis/accounts', signal);
  }

  /** `accountId` is the numeric account ID of a pension or insurance account. */
  public pensionDetails(accountId: string, signal?: AbortSignal): Promise<PensionDetails> {
    return this.get(`/insurance/details/pension-details${pathId(accountId)}`, signal);
  }

  /** Current and next fund allocation for new pension premiums. */
  public pensionDistribution(
    accountId: string,
    signal?: AbortSignal,
  ): Promise<PensionDistribution> {
    return this.get(`/insurance/pension/distribution/v1${pathId(accountId)}/with-future`, signal);
  }

  public payoutPlans(signal?: AbortSignal): Promise<readonly UnverifiedItem[]> {
    return this.get('/insurance-payment/v3/accounts/payout-plans', signal);
  }

  /** Resolves to `null` when the account has no payout plan (HTTP 204). */
  public async payoutPlan(accountId: string, signal?: AbortSignal): Promise<UnverifiedItem | null> {
    const plan = await this.get<UnverifiedItem | undefined>(
      `/insurance-payment/v3/accounts${pathId(accountId)}/payout-plan`,
      signal,
    );
    return plan ?? null;
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
