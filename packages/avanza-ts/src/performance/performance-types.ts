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

export const insightsPeriods = ['TODAY', 'ONE_WEEK', 'THIS_YEAR', 'THREE_YEARS_ROLLING'] as const;

export type InsightsPeriod = (typeof insightsPeriods)[number];

export interface InsightsOutcome {
  readonly total: number;
  readonly development: number;
  readonly dividends: number;
  readonly balanceDevelopments?: readonly { readonly name: string; readonly amount: number }[];
}

export interface InsightsInstrumentLink {
  readonly orderbookId: string;
  readonly type: string;
  readonly flagCode: string;
  readonly urlDisplayName: string;
  readonly linkDisplay: string;
  readonly shortLinkDisplay: string;
  readonly tradeable: boolean;
  readonly sellable: boolean;
  readonly buyable: boolean;
}

export interface InsightsPosition {
  readonly isin: string;
  readonly shortName: string;
  readonly link: InsightsInstrumentLink;
  readonly currentPosition: number;
  readonly startValue: number;
  readonly endValue: number;
  readonly outcome: InsightsOutcome & {
    readonly totalDevelopmentInPercent: number;
    readonly developmentPartOfTotalDevelopmentInPercent: number;
    readonly dividendsPartOfTotalDevelopmentInPercent: number;
    readonly stake: number;
    readonly totalTurnover: number;
    readonly totalBuyAmount: number;
    readonly totalSellAmount: number;
    readonly totalOtherAmount: number;
    readonly transactions: readonly {
      readonly date: string;
      readonly type: string;
      readonly isin: string;
      readonly accountName: string;
      readonly volume: number;
      readonly price: number;
      readonly amount: number;
    }[];
    readonly transactionTotals: readonly {
      readonly transactionType: string;
      readonly presentableTransactionType: string;
      readonly totalAmount: number;
      readonly count: number;
    }[];
  };
}

export interface InsightsInstrumentGroup {
  readonly instrumentType: string;
  readonly instrumentDisplayName: string;
  readonly outcome: InsightsOutcome;
  readonly positions: readonly InsightsPosition[];
}

/** What held positions earned over the period, split into price development and dividends. */
export interface InsightsReport {
  readonly fromDate: string;
  readonly toDate: string;
  readonly totalDevelopment: {
    readonly startValue: number;
    readonly currentValue: number;
    readonly totalChange: number;
  };
  readonly developmentResponse: {
    readonly totalOutcome: InsightsOutcome;
    readonly totalOutcomeForUnknownDevelopments: InsightsOutcome;
    readonly hasUnlistedInstrument: boolean;
    readonly instruments: readonly InsightsInstrumentGroup[];
    readonly bestAndWorst: {
      readonly bestPositions: readonly InsightsInstrumentGroup[];
      readonly worstPositions: readonly InsightsInstrumentGroup[];
    };
    readonly unknownPositionDevelopments: readonly {
      readonly isin: string;
      readonly shortName: string;
      readonly link: string;
      readonly currentPosition: number;
      readonly outcome: InsightsOutcome;
    }[];
    readonly chartData: readonly {
      readonly year: number;
      readonly month: number;
      readonly total: number;
      readonly development: number;
      readonly dividends: number;
    }[];
  };
  readonly transactionsResponse: {
    readonly totalAll: number;
    readonly totalDeposits: number;
    readonly totalWithdraws: number;
    readonly totalAutogiro: number;
    readonly allTransactions: readonly Readonly<Record<string, unknown>>[];
    readonly chartData: readonly {
      readonly year: number;
      readonly month: number;
      readonly allTransactions: number;
      readonly deposit: number;
      readonly withdrawal: number;
      readonly autogiro: number;
    }[];
  };
  readonly otherTransactions: {
    readonly total: number;
    readonly otherTransactionsGroups: readonly {
      readonly year: number;
      readonly month: number;
      readonly total: number;
      readonly transactions: readonly {
        readonly accountId: string;
        readonly accountName: string;
        readonly accountTypeName: string;
        readonly date: string;
        readonly amount: number;
        readonly description: string;
        readonly transactionType: string;
        readonly transactionTypeName: string;
      }[];
    }[];
  };
}

export interface KeyRatiosOptions {
  readonly accountIds?: readonly string[] | undefined;
  readonly includeClosedAccounts?: boolean | undefined;
}

export interface KeyRatiosResponse {
  readonly sharpeRatio: AccountAmount;
  readonly standardDeviation: AccountAmount;
  readonly compoundAnnualGrowthRate: AccountAmount;
}

export interface KeyRatioHistoryOptions extends KeyRatiosOptions {
  /** History start (yyyy-MM-dd); defaults to the earliest available date. */
  readonly fromDate?: string | undefined;
}

export interface TimestampValue {
  readonly timestamp: number;
  readonly value: number;
}

export interface KeyRatioHistoryResponse {
  readonly sharpeRatios: readonly TimestampValue[];
  readonly standardDeviations: readonly TimestampValue[];
  readonly compoundAnnualGrowthRates: readonly TimestampValue[];
  readonly earliestAvailableDate: string;
}

export interface RelativePerformancePoint {
  readonly timestamp: number;
  readonly performance: {
    readonly value: number;
    readonly unit: string;
    readonly unitType: string;
  };
}

/** Development of the average Avanza customer. */
export interface AverageCustomerChartResponse {
  readonly interval: PerformanceDateRange & { readonly timePeriod: string };
  readonly absoluteSeries: readonly RelativePerformancePoint[];
  readonly relativeSeries: readonly RelativePerformancePoint[];
  readonly valueSeries: readonly RelativePerformancePoint[];
  readonly earliestAvailableDate: string;
}

export interface OrderbookPerformanceChart {
  readonly orderbookId: string;
  readonly relativeSeries: readonly RelativePerformancePoint[];
}

export interface YearSecurity {
  readonly orderbookId: string;
  readonly instrumentName: string;
  readonly development: number;
  readonly flagCode: string;
  readonly currentVolume: number;
}

export interface YearDay {
  readonly day: string;
  readonly performanceInCash: number;
}

export interface YearSummaryResponse {
  readonly development: {
    readonly currentValue: number;
    readonly startValue: number;
    readonly totalChange: number;
    readonly totalDevelopment: number;
    readonly totalDeposits: number;
    readonly totalOtherFees: number;
    readonly totalDividends: number;
    readonly totalTjpDeposits: number;
    readonly averageDepositsPerMonth: number;
    readonly suggestedAdditionalSavingPerMonth: number;
    readonly bestSecurities: readonly YearSecurity[];
    readonly worstSecurities: readonly YearSecurity[];
  };
  readonly numberOfTransactionsView: {
    readonly numberOfUniqueSecurities: number;
    readonly numberOfTransactions: number;
  };
  readonly performanceDto: {
    readonly bestDay: YearDay;
    readonly nextBestDay: YearDay;
    readonly thirdBestDay: YearDay;
    readonly worstDay: YearDay;
    readonly performanceForPeriod: number;
    readonly performanceAllCustomers: number;
    readonly performanceOMXS30: number;
    readonly performanceDJUSA: number;
    readonly monthlyPerformance: readonly {
      readonly month: number;
      readonly performanceInCash: number;
    }[];
  };
}

export interface YearLargestTransaction {
  readonly orderbookId: number;
  readonly instrumentType: string;
  readonly countryCode: string;
  readonly instrumentName: string;
  readonly amountInSek: number;
}

export interface YearTransactionsResponse {
  readonly transactionMonthlySummaryViews: readonly {
    readonly month: number;
    readonly buyTransactionAmountInSek: number;
    readonly sellTransactionAmountInSek: number;
  }[];
  readonly buyTransactionAggregatedMax: YearLargestTransaction;
  readonly sellTransactionAggregatedMax: YearLargestTransaction;
  readonly totalBuyAmountInSek: number;
  readonly totalSellAmountInSek: number;
}

/** `relative` is this year's return, `relative-from-start` the return since the first deposit. */
export const yearChartSeries = ['relative', 'relative-from-start', 'value'] as const;

export type YearChartSeries = (typeof yearChartSeries)[number];

export interface YearChartResponse {
  readonly interval: PerformanceDateRange;
  readonly series: readonly TimestampValue[];
  readonly earliestAvailableTimestamp: number;
}

/** `omx` is OMXS30 GI and `usa` Dow Jones US. */
export const yearBenchmarkIndices = ['omx', 'usa'] as const;

export type YearBenchmarkIndex = (typeof yearBenchmarkIndices)[number];

export interface YearBenchmarkResponse {
  readonly series: readonly TimestampValue[];
}
