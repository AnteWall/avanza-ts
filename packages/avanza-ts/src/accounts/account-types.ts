export interface AccountSummary {
  readonly id: string;
  readonly name: string;
  readonly accountType: string;
  readonly urlParameterId: string;
  readonly active: boolean;
  readonly clearingAccountNumber?: string;
  readonly hasCreditAccount?: boolean;
  readonly hasMultipleOwners?: boolean;
  readonly accountSettings?: Readonly<Record<string, boolean>>;
  readonly discretionaryPortfolio?: boolean;
  readonly autoDistribution?: boolean;
}

export type AccountListResponse = readonly AccountSummary[];

export interface ClosedAccount {
  readonly id: string;
  readonly accountType: string;
  readonly closedDate: string | null;
  readonly urlParameterId: string;
}

export type ClosedAccountsResponse = readonly ClosedAccount[];

export interface HasClosedAccountsResponse {
  readonly hasClosedAccounts: boolean;
}

export interface AccountCategory {
  readonly id: string;
  readonly name: string;
  readonly accountIds: readonly string[];
  readonly externalMortgageIds: readonly object[];
  readonly order: number;
  readonly savingsGoal: boolean;
}

export interface AccountCategoriesResponse {
  readonly accounts: AccountListResponse;
  readonly categories: readonly AccountCategory[];
}

export interface AccountAmount {
  readonly value: number;
  readonly unit: string;
  readonly unitType: string;
  readonly decimalPrecision: number;
}

export interface AccountOverviewResponse {
  readonly category: {
    readonly id: string;
    readonly name: string;
    readonly savingsGoalView: object | null;
  };
  readonly account: {
    readonly id: string;
    readonly type: string;
    readonly balance: AccountAmount;
    readonly buyingPower: AccountAmount;
    readonly buyingPowerWithoutCredit: AccountAmount;
    readonly credit: AccountAmount | null;
    readonly name: {
      readonly defaultName: string;
      readonly userDefinedName: string | null;
    };
    readonly status: string;
    readonly urlParameterId: string;
    readonly currencyBalances: readonly AccountAmount[];
    readonly pendingRebalance: boolean;
    readonly autoDistribution: boolean;
    readonly discretionaryPortfolio: boolean;
  };
}

export interface CategorizedAccountOverviewResponse {
  readonly categories: readonly {
    readonly id: string;
    readonly name: string;
    readonly totalValue: AccountAmount;
    readonly performance: Readonly<
      Record<string, { readonly absolute: AccountAmount; readonly relative: AccountAmount }>
    >;
    readonly savingsGoalView: object | null;
  }[];
  readonly accounts: readonly {
    readonly id: string;
    readonly categoryId: string;
    readonly type: string;
    readonly balance: AccountAmount;
    readonly totalValue: AccountAmount;
    readonly urlParameterId: string;
    readonly name: {
      readonly defaultName: string;
      readonly userDefinedName: string | null;
    };
  }[];
  readonly loans: readonly object[];
}

export interface TradingPosition {
  readonly accountId: string;
  readonly volume: number;
  readonly isin: string;
  readonly currency: string;
  readonly orderbookId: string;
  readonly name: string;
  readonly instrumentType: string;
  readonly marketValue: number;
  readonly price: number;
}

export interface TradingAccount {
  readonly name: string;
  readonly accountId: string;
  readonly accountType: string;
  readonly accountTypeName: string;
  readonly urlParameterId: string;
  readonly availableForPurchase: number;
  readonly availableForPurchaseWithoutCredit: number;
  readonly availableCredit: number;
  readonly hasCredit: boolean;
  readonly isTradable: boolean;
  readonly isShortSellable: boolean;
  readonly isOvermortgaged: boolean;
  readonly isOverdrawn: boolean;
  readonly isHidden: boolean;
  readonly isDiscretionaryAccount: boolean;
  readonly positions: readonly TradingPosition[];
  readonly currencyBalances: readonly {
    readonly currency: string;
    readonly countryCode: string;
    readonly balance: number;
  }[];
}

export type TradingAccountsResponse = readonly TradingAccount[];

export interface LightweightAccount {
  readonly name: string;
  readonly accountId: string;
  readonly accountTypeName: string;
  readonly accountType: string;
  readonly isTradable: boolean;
  readonly urlParameterId: string;
}

export type LightweightAccountsResponse = readonly LightweightAccount[];
