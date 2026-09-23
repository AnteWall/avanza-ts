import type { AccountAmount } from '../accounts/account-types.js';

export interface TransactionListFilter {
  /** `yyyy-MM-dd`; the API defaults to one year before `to`. */
  readonly from?: string | undefined;
  /** `yyyy-MM-dd`; the API defaults to today. */
  readonly to?: string | undefined;
  readonly accountIds?: readonly string[] | undefined;
  /** For example `BUY`, `SELL`, `DIVIDEND`, `DEPOSIT`, or `WITHDRAW`. */
  readonly transactionTypes?: readonly string[] | undefined;
  readonly isin?: string | undefined;
  readonly includeCancelled?: boolean | undefined;
  readonly includeClosedAccounts?: boolean | undefined;
}

export interface TransactionOrderbook {
  readonly id: string;
  readonly flagCode: string | null;
  readonly name: string;
  readonly marketplace: string;
  readonly type: string;
  readonly currency: string;
  readonly isin: string;
  readonly volumeFactor: number;
}

export interface Transaction {
  readonly id: string;
  readonly date: string;
  readonly settlementDate: string;
  readonly availabilityDate: string | null;
  readonly tradeDate: string | null;
  readonly account: {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly urlParameterId: string;
  };
  readonly orderbook: TransactionOrderbook | null;
  readonly instrumentName: string | null;
  readonly description: string;
  readonly type: string;
  readonly backofficeType: string;
  readonly backofficeTypeText: string;
  readonly volume: AccountAmount | null;
  readonly priceInTradedCurrency: AccountAmount | null;
  readonly priceInTransactionCurrency: AccountAmount | null;
  readonly amount: AccountAmount | null;
  readonly commission: AccountAmount | null;
  readonly currencyRate: AccountAmount | null;
  readonly foreignTaxRate: AccountAmount | null;
  readonly result: AccountAmount | null;
  readonly onCreditAccount: boolean;
  readonly intraday: boolean;
  readonly cancelled: boolean;
  readonly cancelDate: string | null;
  readonly noteId: string | null;
  readonly isin: string | null;
  readonly volumeFactor: number | null;
  readonly verificationNumber: string;
}

export interface TransactionListResponse {
  readonly transactions: readonly Transaction[];
  readonly transactionsAfterFiltering: number;
  readonly transactionsFilter: {
    readonly accountIds: readonly string[] | null;
    readonly transactionTypes: readonly string[] | null;
    readonly isin: string | null;
    readonly dateRange: { readonly from: string; readonly to: string };
    readonly includeCancelled: boolean;
    readonly includeClosedAccounts: boolean;
  };
  readonly firstTransactionDate: string;
}

export interface PendingTransactionsResponse {
  readonly withdrawals: readonly object[];
  readonly internalTransfers: readonly object[];
}

export interface DividendOptions {
  readonly accountId?: string | undefined;
  readonly includeClosedAccounts?: boolean | undefined;
}

export interface DividendAmount {
  readonly value: number;
  readonly currency: string;
}

export interface Dividend {
  readonly isin: string;
  readonly date: string;
  readonly instrumentName: string;
  readonly orderbook: TransactionOrderbook | null;
  readonly accountId: string;
  readonly encryptedAccountId: string;
  readonly volume: number;
  readonly amount: DividendAmount | null;
  readonly amountInSek: number;
  readonly amountPerShare: DividendAmount | null;
  readonly amountPerShareInSek: number;
  readonly transactionCurrency: string;
  readonly currencyRate: number | null;
  readonly stockRedemptionPayment: boolean;
}

export type DividendsResponse = readonly Dividend[];

export interface UpcomingDividend {
  readonly isin: string;
  readonly date: string;
  readonly exDate: string;
  /** For example `CONFIRMED` or `PRELIMINARY`. */
  readonly status: string;
  readonly instrumentName: string;
  readonly orderbook: Omit<TransactionOrderbook, 'volumeFactor'> & {
    readonly volumeFactor: number | null;
  };
  readonly accountId: string;
  readonly encryptedAccountId: string;
  readonly volume: number;
  readonly amount: DividendAmount;
  readonly amountInSek: number;
  readonly amountPerShare: DividendAmount;
  readonly amountPerShareInSek: number;
}

export type UpcomingDividendsResponse = readonly UpcomingDividend[];
