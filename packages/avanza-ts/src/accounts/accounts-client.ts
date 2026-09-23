import type { ClientContext } from '../internal/client-context.js';
import { pathId } from '../internal/path-id.js';
import type {
  AccountCategoriesResponse,
  AccountListResponse,
  AccountOverviewResponse,
  CategorizedAccountOverviewResponse,
  ClosedAccountsResponse,
  HasClosedAccountsResponse,
  LightweightAccountsResponse,
  TradingAccountsResponse,
} from './account-types.js';

export class AccountsClient {
  public constructor(protected readonly context: ClientContext) {}

  public list(signal?: AbortSignal): Promise<AccountListResponse> {
    return this.get('/_api/account-overview/accounts/list', signal);
  }

  public closed(signal?: AbortSignal): Promise<ClosedAccountsResponse> {
    return this.get('/_api/account-overview/accounts/closed', signal);
  }

  public hasClosed(signal?: AbortSignal): Promise<HasClosedAccountsResponse> {
    return this.get('/_api/account-overview/accounts/has-closed', signal);
  }

  public categories(signal?: AbortSignal): Promise<AccountCategoriesResponse> {
    return this.get('/_api/account-overview/accounts/categories', signal);
  }

  public overview(accountId: string, signal?: AbortSignal): Promise<AccountOverviewResponse> {
    return this.get(`/_api/account-overview/overview/account${pathId(accountId)}`, signal);
  }

  public categorizedOverview(signal?: AbortSignal): Promise<CategorizedAccountOverviewResponse> {
    return this.get('/_api/account-overview/overview/categorizedAccounts', signal);
  }

  public tradingAccounts(signal?: AbortSignal): Promise<TradingAccountsResponse> {
    return this.get('/_api/trading-critical/rest/accounts', signal);
  }

  public accountsAndPositions(signal?: AbortSignal): Promise<TradingAccountsResponse> {
    return this.get('/_api/trading-critical/rest/accountsandpositions', signal);
  }

  public lightweightAccounts(signal?: AbortSignal): Promise<LightweightAccountsResponse> {
    return this.get('/_api/trading-critical/rest/lightweightaccounts', signal);
  }

  private get<Response>(path: string, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method: 'GET',
      path,
      signal,
    });
  }
}
