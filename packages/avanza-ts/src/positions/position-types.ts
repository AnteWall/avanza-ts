import type { AccountAmount } from '../accounts/account-types.js';

export interface PositionCountryAllocation {
  readonly positionId: string;
  readonly allocations: readonly {
    readonly name: string;
    readonly amount: AccountAmount;
  }[];
}

export type PositionCountriesResponse = readonly PositionCountryAllocation[];

export interface ActivePositionTool {
  readonly orderbookId: string;
  readonly hasAlert: boolean;
  readonly hasNote: boolean;
  readonly inWatchlist: boolean;
}

export type ActivePositionToolsResponse = readonly ActivePositionTool[];

export interface PositionOrderbook {
  readonly id: string;
  readonly flagCode: string | null;
  readonly name: string;
  readonly isin: string;
  readonly instrumentId: string;
  readonly currency: string;
}

export type PositionOrderbooksResponse = readonly PositionOrderbook[];

export interface PositionCategoriesResponse {
  readonly categoryStatistics: readonly {
    readonly menCount: number;
    readonly womenCount: number;
    readonly fromAge: number;
    readonly toAge: number;
  }[];
  readonly cloud: boolean;
}

export interface PositionPopularCategoriesResponse {
  readonly popularCategories: readonly {
    readonly gender: string;
    readonly fromAge: number;
    readonly toAge: number;
  }[];
  readonly cloud: boolean;
}

/** Dividend and valuation ratios for one stock position; ratios are `null` when unknown. */
export interface StockPositionKeyRatios {
  readonly positionId: string;
  readonly yearlyDividend: AccountAmount | null;
  readonly relativeYearlyDividend: AccountAmount;
  readonly dividendsPerYear: number | null;
  readonly nextDividendDate: string | null;
  readonly nextDividend: AccountAmount | null;
  readonly yieldOnCost: AccountAmount;
  readonly priceEarnings: AccountAmount | null;
  readonly priceSales: AccountAmount | null;
  readonly priceBookRatio: AccountAmount | null;
  readonly turnoverPerShare: AccountAmount | null;
  readonly equityPerShare: AccountAmount | null;
  readonly earningsPerShare: AccountAmount | null;
  readonly beta: AccountAmount | null;
}

export type StockPositionKeyRatiosResponse = readonly StockPositionKeyRatios[];

export interface FundView {
  readonly name: string;
  readonly isin: string;
  readonly fundRisk: number;
  readonly rating: number;
  readonly managementFee: number | null;
  readonly productFee: number | null;
  readonly sharpeRatio: number | null;
  readonly standardDeviation: number | null;
  readonly changeSinceThreeYears: number | null;
  readonly marketValue: number;
  readonly revenue: number | null;
  readonly accountMarketValue: readonly unknown[];
  readonly lowCarbon: boolean;
  readonly carbonRisk: number | null;
  readonly percentAumCoveredCarbon: number | null;
  readonly fossilFuelInvolvement: number | null;
  readonly sustainabilityScore: number | null;
  readonly environmentalScore: number | null;
  readonly socialScore: number | null;
  readonly governanceScore: number | null;
}

/** One slice of a look-through chart; `y` is the share in percent. */
export interface FundExposure {
  readonly name: string;
  readonly y: number;
  readonly color: string;
  readonly currency: string;
  /** For example `EQUITY`; empty when unknown. */
  readonly type: string;
  readonly countryCode: string;
  readonly riskStatus: string;
  /** Funds contributing to the slice. */
  readonly fundList: readonly FundView[];
}

/** Look-through of the fund holdings in the given accounts. */
export interface FundAnalysisResponse {
  readonly nrOfFunds: number;
  readonly averageFundRisk: number;
  readonly averageRating: number;
  readonly averageManagementFee: number;
  readonly averageProductFee: number;
  readonly averageSharpeRatio: number;
  readonly averageStandardDeviation: number;
  readonly averageRevenue: number;
  readonly averageChangeSinceThreeYears: number;
  readonly averageCarbonRiskScore: number;
  readonly averagePercentAumCoveredCarbon: number;
  readonly averageFossilFuelInvolvement: number;
  readonly averageSustainabilityScore: number;
  readonly averageEnvironmentalScore: number;
  readonly averageSocialScore: number;
  readonly averageGovernanceScore: number;
  readonly noOfLowCarbonFunds: number;
  readonly industryChartData: readonly FundExposure[];
  readonly stockChartData: readonly FundExposure[];
  readonly regionChartData: readonly FundExposure[];
  readonly countryChartData: readonly FundExposure[];
  readonly currencyChartData: readonly FundExposure[];
  readonly fundViews: readonly FundView[];
}
