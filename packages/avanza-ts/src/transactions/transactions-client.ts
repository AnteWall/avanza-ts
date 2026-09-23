import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import type {
  DividendOptions,
  DividendsResponse,
  PendingTransactionsResponse,
  Transaction,
  TransactionListFilter,
  TransactionListResponse,
} from './transactions-types.js';

export class TransactionsClient {
  public constructor(protected readonly context: ClientContext) {}

  public list(
    filter: TransactionListFilter = {},
    signal?: AbortSignal,
  ): Promise<TransactionListResponse> {
    return this.get('/list', signal, { ...filter });
  }

  public pending(signal?: AbortSignal): Promise<PendingTransactionsResponse> {
    return this.get('/pending', signal);
  }

  /** `accountId` is an account ID or URL parameter ID. */
  public transaction(
    accountId: string,
    transactionId: string,
    signal?: AbortSignal,
  ): Promise<Transaction> {
    return this.get(`/transaction${pathId(accountId)}${pathId(transactionId)}`, signal);
  }

  public dividends(
    options: DividendOptions = {},
    signal?: AbortSignal,
  ): Promise<DividendsResponse> {
    return this.get(`/dividends${pathId(options.accountId)}`, signal, {
      includeClosedAccounts: options.includeClosedAccounts || undefined,
    });
  }

  private get<Response>(
    path: string,
    signal?: AbortSignal,
    query: NonNullable<HttpRequest['query']> = {},
  ): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method: 'GET',
      path: `/_api/transactions${path}`,
      query,
      signal,
    });
  }
}
