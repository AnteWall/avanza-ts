/** Item fields are unverified; captured lists were empty so far. */
export type UnverifiedItem = Readonly<Record<string, unknown>>;

export interface PeriodicSavingsResponse {
  readonly periodicSavings: readonly UnverifiedItem[];
}

export interface RecurringDepositsResponse {
  readonly autogiroResponseList: readonly UnverifiedItem[];
}

export interface SavingsCategoryAccount {
  readonly id: number;
  readonly name: string;
  readonly accountType: string;
  readonly accountDomain: string;
  readonly totalValue: number;
  readonly externalAccountNumber: { readonly value: string };
  readonly isHidden: boolean;
  readonly isValidForSharedGoal: boolean;
  readonly validForSharedGoal: boolean;
}

export interface SavingsCategory {
  readonly categoryId: string;
  readonly name: string;
  /** For example `SAVINGS_GOAL` or `DEFAULT`. */
  readonly categoryType: string;
  readonly sortOrder: number;
  readonly totalValue: number;
  readonly accounts: readonly SavingsCategoryAccount[];
}

export interface SavingsGoalHealth {
  readonly averageMonthlySavings: number;
  readonly averageMonthlySavingsTarget: number;
  readonly averageYearlyPerformance: number;
  readonly averageYearlyPerformanceTarget: number;
  readonly totalPerformanceTarget: number;
}

export const savingsGoalPeriods = [
  'ONE_WEEK',
  'ONE_MONTH',
  'THREE_MONTHS',
  'THIS_YEAR',
  'ONE_YEAR',
  'THREE_YEARS',
  'INFINITY',
] as const;

export type SavingsGoalPeriod = (typeof savingsGoalPeriods)[number];

export interface SavingsGoalPoint {
  /** Change in percent (`goalAggregatedPerformance`) or cash (`goalAggregatedPerformanceCash`). */
  readonly value: number;
  readonly totalValue: number;
  readonly timestamp: number;
}

export interface SavingsGoalPerformance {
  /** For example `MONTH`. */
  readonly graphResolution: string;
  readonly goalTotalPerformance: number;
  readonly goalTotalPerformanceCash: number;
  readonly goalAggregatedPerformance: readonly SavingsGoalPoint[];
  readonly goalAggregatedPerformanceCash: readonly SavingsGoalPoint[];
  /** Per-member series for shared goals. */
  readonly memberPerformanceDataPoints: readonly UnverifiedItem[];
}

export interface CreditAccountsResponse {
  readonly accounts: readonly UnverifiedItem[];
}

export interface InsuranceParty {
  readonly name: string;
  readonly insuranceCustomerId: string;
  readonly type: string;
}

export interface PensionDetails {
  readonly accountName: string;
  readonly encryptedAccountId: string;
  /** For example `TJP`. */
  readonly accountType: string;
  readonly status: string;
  readonly startDate: string;
  readonly managementForm: string;
  readonly repaymentProtection: string;
  readonly isOwner: boolean;
  readonly insured: InsuranceParty;
  readonly policyOwner: InsuranceParty;
  readonly beneficiaries: {
    readonly text: readonly string[];
    readonly type: string;
    readonly beneficiaryType: string;
    readonly beneficiaries: readonly UnverifiedItem[];
    readonly privateProperty: boolean;
    readonly irrevocable: boolean;
  };
  readonly paymentPlan: {
    readonly status: string;
    readonly guaranteedMinAmount: boolean;
    readonly start: unknown;
    readonly startMonth: unknown;
  };
  readonly tax: unknown;
  readonly companyOwnedDetails: unknown;
  readonly childControlDetails: unknown;
}

export interface PensionDistribution {
  readonly currentAllocation: readonly {
    readonly orderbookId: string;
    /** Percent. */
    readonly allocation: number;
  }[];
  readonly nextAutoDistribution: unknown;
}
