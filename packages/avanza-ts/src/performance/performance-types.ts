import type { AccountAmount } from '../accounts/account-types.js';

export const performancePeriods = [
  'TODAY',
  'ONE_WEEK',
  'ONE_MONTH',
  'THREE_MONTHS',
  'THIS_YEAR',
  'ONE_YEAR',
  'THREE_YEARS',
  'FIVE_YEARS',
  'ALL_TIME',
] as const;

export type PerformancePeriod = (typeof performancePeriods)[number];

export interface PerformanceDateRange {
  readonly from: string;
  readonly to: string;
}

export interface PerformanceChartOptions {
  readonly accountIds?: readonly string[] | undefined;
  readonly includeClosedAccounts?: boolean | undefined;
}

export interface PerformancePoint {
  readonly timestamp: number;
  readonly performance: AccountAmount;
}

export interface PerformanceChartResponse {
  readonly interval: PerformanceDateRange & { readonly timePeriod: string };
  readonly timePeriod: string;
  readonly absoluteSeries: readonly PerformancePoint[];
  readonly relativeSeries: readonly PerformancePoint[];
  readonly valueSeries: readonly PerformancePoint[];
  readonly earliestAvailableDate: string;
}

export interface PerformanceDevelopment {
  readonly absolute: AccountAmount;
  readonly relative: AccountAmount;
}

export interface CurrencyBalance {
  readonly balance: AccountAmount;
}

export interface TotalValue {
  readonly totalValue: AccountAmount;
  readonly positionValue: AccountAmount;
  readonly balanceOnTradingAccounts: AccountAmount;
  readonly balanceOnSavingsAccounts: AccountAmount;
  readonly accruedInterest: AccountAmount;
  readonly accruedCreditInterest: AccountAmount;
  readonly accruedDebitInterest: AccountAmount;
  readonly forwardBalance: AccountAmount;
  readonly currencyBalances: readonly CurrencyBalance[];
}

export interface BuyingPower {
  readonly total: AccountAmount;
  readonly totalExcludingCredit: AccountAmount;
  readonly balanceOnTradableAccounts: AccountAmount;
  readonly currentOrders: AccountAmount;
  readonly availableCredit: AccountAmount;
  readonly totalMarginRequirement: AccountAmount;
  readonly forwardResult: AccountAmount;
  readonly grossExposureLimit: AccountAmount;
  readonly grossExposure: AccountAmount;
  readonly negativeAccruedInterest: AccountAmount;
  readonly currencyBalances: readonly CurrencyBalance[];
}

export interface TotalValuesAccount {
  readonly info: {
    readonly id: string;
    readonly type: string;
    readonly name: string;
    readonly urlParameterId: string;
    readonly hasCredit: boolean;
    readonly discretionaryPortfolio: boolean;
  };
  readonly isTradable: boolean;
  readonly totalValue: TotalValue;
  readonly buyingPower: BuyingPower;
  readonly overdrawn: readonly { readonly amount: AccountAmount; readonly type: string }[];
  readonly overmortgaged: object | null;
}

export interface TotalValuesResponse {
  readonly totalValue: TotalValue;
  readonly totalDevelopment: Readonly<Partial<Record<PerformancePeriod, PerformanceDevelopment>>>;
  readonly buyingPower: BuyingPower;
  readonly hasCredit: boolean;
  readonly accounts: readonly TotalValuesAccount[];
}
