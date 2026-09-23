export interface FundSearchView {
  readonly isin: string;
  readonly name: string;
  readonly orderbookId: string;
  readonly rating: number | null;
  readonly risk: number;
  readonly developmentOneYear: number | null;
  readonly developmentThreeYears: number | null;
  readonly developmentFiveYears: number | null;
  readonly managementFee: number;
  readonly totalFee: number;
  readonly prospectusLink: string;
  readonly minimumBuy: number;
  readonly foreignExchange: boolean;
  readonly buyable: boolean;
}

export interface FundSearchResponse {
  readonly fundSearchViews: readonly FundSearchView[];
}

export type FundSortDirection = 'ASCENDING' | 'DESCENDING';

/** Filter values come from the `filterCounts` titles in a list response. */
export interface FundListOptions {
  readonly name?: string | undefined;
  /** A `FundListView` field, for example `developmentThreeYears`. */
  readonly sortField?: string | undefined;
  readonly sortDirection?: FundSortDirection | undefined;
  readonly startIndex?: number | undefined;
  readonly maxNoResults?: number | undefined;
  readonly filter?:
    | Readonly<Record<string, boolean | number | string | readonly string[] | null>>
    | undefined;
}

export interface FundRatingView {
  readonly date: string;
  readonly fundRatingType: string;
  readonly fundRating: number;
}

export interface FundProductInvolvement {
  readonly product: string;
  readonly productDescription: string;
  readonly value: number;
}

export interface FundNamedValue {
  readonly name: string;
  readonly value: string;
}

export interface FundListView {
  readonly isin: string;
  readonly name: string;
  readonly orderbookId: string;
  readonly rating: number | null;
  readonly risk: number;
  readonly developmentOneDay: number | null;
  readonly developmentOneWeek: number | null;
  readonly developmentOneMonth: number | null;
  readonly developmentThreeMonths: number | null;
  readonly developmentOneYear: number | null;
  readonly developmentThisYear: number | null;
  readonly developmentThreeYears: number | null;
  readonly developmentFiveYears: number | null;
  readonly developmentTenYears: number | null;
  readonly lowCarbon: boolean | null;
  readonly sharpeRatio: number | null;
  readonly standardDeviation: number | null;
  readonly capital: number;
  readonly fossilFuelInvolvement: number | null;
  readonly carbonRiskScore: number | null;
  readonly primaryBenchmark: string | null;
  readonly recommendedHoldingPeriod: string;
  readonly recommendedHoldingPeriodValue: string;
  readonly esgScore: number | null;
  readonly environmentalScore: number | null;
  readonly socialScore: number | null;
  readonly governanceScore: number | null;
  readonly managementFee: number;
  readonly totalFee: number;
  readonly transactionFee: number;
  readonly ongoingFee: number;
  readonly otherFee: number;
  readonly minimumBuy: number;
  readonly minimumBuyMonthlySaving: number;
  readonly hasCurrencyExchangeFee: boolean;
  readonly nrOfOwners: number;
  readonly tagList: readonly { readonly title: string; readonly fundTagCategory: string }[];
  readonly category: string;
  readonly indexFund: boolean;
  readonly startDate: string;
  readonly collateralValue: number;
  readonly superloanOrderbook: boolean;
  readonly fundType: string;
  readonly companyName: string;
  readonly sustainabilityLevel: string | null;
  readonly sustainabilityRating: number | null;
  readonly sustainabilityRatingCategoryName: string;
  readonly productInvolvementViews: readonly FundProductInvolvement[];
  readonly carbonSolutionsInvolvement: number | null;
  readonly aumCoveredCarbon: number | null;
  readonly thermalCoalInvolvement: number | null;
  readonly oilSandsExtractionInvolvement: number | null;
  readonly arcticOilAndGasExplorationInvolvement: number | null;
  readonly environmentalRating: number | null;
  readonly socialRating: number | null;
  readonly governanceRating: number | null;
  readonly prospectusLink: string;
  readonly currencyCode: string;
  readonly svanen: boolean;
  readonly nrBuyOrders: number;
  readonly nrSellOrders: number;
  readonly managedType: string;
  readonly nav: number;
  readonly navDate: string;
  readonly fundRatingViews: readonly FundRatingView[];
  readonly euArticleType: FundNamedValue;
  readonly type: string;
  readonly hasCashDividends: boolean;
  readonly buyable: boolean;
}

export interface FundFilterCount {
  readonly title: string;
  readonly count: number;
  readonly type: string;
  readonly active: boolean;
  readonly group: number;
}

export interface FundListResponse {
  readonly fundListViews: readonly FundListView[];
  readonly totalNoFunds: number;
  readonly filterCounts: Readonly<Record<string, readonly FundFilterCount[]>>;
  readonly filteredFundsMetaData: {
    readonly averageRisk: number;
    readonly averageTotalFee: number;
    readonly averageEsgScore: number;
    readonly numberOfFundsRisk: number;
    readonly numberOfFundsTotalFee: number;
    readonly numberOfFundsEsgScore: number;
    readonly numberOfFunds: number;
    readonly numberOfEtfs: number;
  };
}

export interface FundInstrumentSearchResponse {
  readonly totalNumberOfHits: number;
  readonly orderbookSearchViews: readonly { readonly orderbookId: string; readonly name: string }[];
}

export type FundInstrumentType = 'FUND' | 'EXCHANGE_TRADED_FUND' | 'BOTH';

export interface FundTopTenOptions {
  /** A `FundTopListView` field, for example `developmentOneYear`. */
  readonly sortField?: string | undefined;
  readonly sortDirection?: FundSortDirection | undefined;
  readonly fundInstrumentType?: FundInstrumentType | undefined;
}

export interface FundTopListView {
  readonly isin: string;
  readonly name: string;
  readonly orderbookId: string;
  readonly rating: number | null;
  readonly risk: number;
  readonly developmentThreeMonths: number | null;
  readonly developmentOneYear: number | null;
  readonly developmentThreeYears: number | null;
  readonly developmentFiveYears: number | null;
  readonly managementFee: number;
  readonly totalFee: number;
  readonly nrOfOwners: number;
  readonly nrOfBuyOrders: number;
  readonly nrOfSellOrders: number;
  readonly esgScore: number | null;
  readonly fundRatingViews: readonly FundRatingView[];
  readonly type: string;
}

export interface FundTopTenResponse {
  readonly fundTopListViews: readonly FundTopListView[];
}

export interface FundOrderbook {
  readonly orderbookId: string;
  readonly name: string;
  readonly minimumThresholdBuy: number;
  readonly minimumThresholdAdditionalBuy: number;
  readonly productFee: number;
  readonly prospectusLink: string;
  readonly buyStopDateTime: string;
  readonly sellStopDateTime: string;
  readonly nav: number;
  readonly navDate: string;
  readonly buyCommission: number;
  readonly hasCurrencyExchangeFee: boolean;
  readonly buyable: boolean;
  readonly privateAsset: boolean;
}

export interface FundOrderbookDetails extends Omit<FundOrderbook, 'privateAsset'> {
  readonly rating: number | null;
  readonly risk: string;
  readonly riskNumber: number;
  readonly owners: number;
  readonly description: string;
  readonly navChangeThreeMonths: number | null;
  readonly navChangeOneYear: number | null;
  readonly navChangeThreeYears: number | null;
  readonly navChangeFiveYears: number | null;
  readonly navChangeTenYears: number | null;
  readonly managementFee: number;
  readonly fundCompanyName: string;
}

export interface FundPieChartPoint {
  readonly name: string;
  readonly value: number;
}

export interface FundChartResponse {
  readonly id: string;
  readonly name: string;
  readonly fromDate: string;
  readonly toDate: string;
  /** `x` is a timestamp in milliseconds; `y` is the change in percent. */
  readonly dataSerie: readonly { readonly x: number; readonly y: number }[];
}

export interface FundReference {
  readonly isin: string;
  readonly name: string;
  readonly description: string;
  readonly rating: number | null;
  readonly managementFee: number;
  readonly riskLevel: { readonly riskNumber: number; readonly riskText: string };
  readonly nav: number;
  readonly navDate: string;
  readonly currency: string;
  readonly indexFund: boolean;
  readonly sharpeRatio: number | null;
  readonly standardDeviation: number | null;
  readonly capital: number;
  readonly startDate: string;
  readonly fundManagers: readonly { readonly name: string; readonly startDate: string }[];
  readonly adminCompany: { readonly name: string; readonly country: string; readonly url: string };
  readonly pricingFrequency: string;
  readonly categories: readonly string[];
  readonly fundTypeName: string;
  readonly fundType: string;
  readonly primaryBenchmark: string | null;
  readonly hedgeFund: boolean;
  readonly ucitsFund: boolean;
  readonly recommendedHoldingPeriod: string;
  readonly ppmCode: string | null;
  readonly managedType: string;
  readonly fundRatings: readonly FundRatingView[];
  readonly excludedFromPromotion: boolean;
}

export interface FundDevelopment {
  readonly developmentOneDay: number | null;
  readonly developmentOneWeek: number | null;
  readonly developmentOneMonth: number | null;
  readonly developmentThreeMonths: number | null;
  readonly developmentSixMonths: number | null;
  readonly developmentOneYear: number | null;
  readonly developmentThisYear: number | null;
  readonly developmentThreeYears: number | null;
  readonly developmentFiveYears: number | null;
  readonly developmentTenYears: number | null;
}

export interface FundPortfolioPoint {
  readonly name: string;
  readonly y: number;
  readonly previousY: number;
  readonly deltaRank: number | null;
  readonly type: string | null;
  readonly currency: string | null;
  readonly countryCode: string | null;
  readonly isin: string | null;
  readonly orderbookId: string | null;
}

export interface FundPortfolioData {
  readonly countryChartData: readonly FundPortfolioPoint[];
  readonly holdingChartData: readonly FundPortfolioPoint[];
  readonly sectorChartData: readonly FundPortfolioPoint[];
  readonly portfolioDate: string;
  readonly previousPortfolioDate: string;
}

export interface FundSustainability {
  readonly lowCarbon: boolean;
  readonly svanen: boolean;
  readonly esgScore: number | null;
  readonly environmentalScore: number | null;
  readonly socialScore: number | null;
  readonly governanceScore: number | null;
  readonly controversyScore: number | null;
  readonly environmentalRating: number | null;
  readonly socialRating: number | null;
  readonly governanceRating: number | null;
  readonly sustainabilityRating: number | null;
  readonly sustainabilityRatingCategoryName: string;
  readonly carbonRiskScore: number | null;
  readonly carbonSolutionsInvolvement: number | null;
  readonly aumCoveredCarbon: number | null;
  readonly fossilFuelInvolvement: number | null;
  readonly thermalCoalInvolvement: number | null;
  readonly thermalCoalPowerGenerationInvolvement: number | null;
  readonly oilSandsExtractionInvolvement: number | null;
  readonly arcticOilAndGasExplorationInvolvement: number | null;
  readonly oilAndGasProductionInvolvement: number | null;
  readonly productInvolvements: readonly (FundProductInvolvement & { readonly name: string })[];
  readonly euArticleType: FundNamedValue;
  readonly sustainabilityDevelopmentGoals: readonly (FundNamedValue & {
    readonly type: string;
    readonly status: string;
  })[];
}

/** The complete fund page: reference data, returns, allocation, and sustainability. */
export interface FundGuide {
  readonly isin: string;
  readonly name: string;
  readonly description: string;
  readonly nav: number;
  readonly navDate: string;
  readonly currency: string;
  readonly rating: number | null;
  readonly risk: number;
  readonly riskText: string;
  readonly productFee: number;
  readonly managementFee: number;
  readonly developmentOneDay: number | null;
  readonly developmentOneMonth: number | null;
  readonly developmentThreeMonths: number | null;
  readonly developmentSixMonths: number | null;
  readonly developmentOneYear: number | null;
  readonly developmentThisYear: number | null;
  readonly developmentThreeYears: number | null;
  readonly developmentFiveYears: number | null;
  readonly countryChartData: readonly FundPortfolioPoint[];
  readonly holdingChartData: readonly FundPortfolioPoint[];
  readonly sectorChartData: readonly FundPortfolioPoint[];
  readonly portfolioDate: string;
  readonly indexFund: boolean;
  readonly hedgeFund: boolean;
  readonly ucitsFund: boolean;
  readonly superloanOrderbook: boolean;
  readonly sharpeRatio: number | null;
  readonly standardDeviation: number | null;
  readonly capital: number;
  readonly startDate: string;
  readonly fundManagers: readonly { readonly name: string; readonly startDate: string }[];
  readonly adminCompany: { readonly name: string; readonly country: string; readonly url: string };
  readonly pricingFrequency: string;
  readonly prospectusLink: string;
  readonly categories: readonly string[];
  readonly fundTypeName: string;
  readonly fundType: string;
  readonly primaryBenchmark: string | null;
  readonly recommendedHoldingPeriod: string;
  readonly ppmCode: string | null;
  readonly lowCarbon: boolean | null;
  readonly svanen: boolean;
  readonly esgScore: number | null;
  readonly environmentalScore: number | null;
  readonly socialScore: number | null;
  readonly governanceScore: number | null;
  readonly controversyScore: number | null;
  readonly sustainabilityRating: number | null;
  readonly sustainabilityRatingCategoryName: string;
  readonly carbonRiskScore: number | null;
  readonly carbonSolutionsInvolvement: number | null;
  readonly aumCoveredCarbon: number | null;
  readonly fossilFuelInvolvement: number | null;
  readonly productInvolvements: readonly FundProductInvolvement[];
  readonly fundRatingViews: readonly FundRatingView[];
}

export interface FundDescription {
  readonly heading: string;
  /** The fund's description text. */
  readonly response: string;
  readonly detailedCategoryDescription: string;
}
