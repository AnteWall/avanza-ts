import type { PerformanceDateRange } from '../performance/performance-types.js';

export const searchInstrumentTypes = [
  'STOCK',
  'INDEX',
  'FUND',
  'EXCHANGE_TRADED_FUND',
  'CERTIFICATE',
  'WARRANT',
  'TRADING_CURRENCY',
  'BOND',
  'PREMIUM_BOND',
  'EQUITY_LINKED_BOND',
  'OPTION',
  'SUBSCRIPTION_OPTION',
  'CONVERTIBLE',
  'FUTURE_FORWARD',
  'RIGHT',
  'PAGE',
  'FAQ',
] as const;

export type SearchInstrumentType = (typeof searchInstrumentTypes)[number];

export interface SearchOptions {
  readonly types?: readonly SearchInstrumentType[] | undefined;
  readonly from?: number | undefined;
  readonly size?: number | undefined;
}

export interface SearchHitPrice {
  readonly last: string | null;
  readonly currency: string | null;
  readonly todayChangePercent: string | null;
  readonly todayChangeValue: string | null;
  readonly todayChangeDirection: number;
  readonly threeMonthsAgoChangePercent: string | null;
  readonly threeMonthsAgoChangeDirection: number;
  readonly spread: string | null;
}

export interface SearchHitSector {
  readonly id: number;
  readonly level: number;
  readonly name: string;
  readonly englishName: string;
  readonly highlightedName: string | null;
}

export interface SearchHit {
  readonly type: SearchInstrumentType | 'UNKNOWN';
  readonly title: string;
  readonly highlightedTitle: string;
  readonly description: string;
  readonly highlightedDescription: string;
  readonly path: string | null;
  readonly flagCode: string | null;
  readonly orderBookId: string | null;
  readonly urlSlugName: string | null;
  readonly tradeable: boolean;
  readonly sellable: boolean;
  readonly buyable: boolean;
  readonly price: SearchHitPrice | null;
  readonly stockSectors: readonly SearchHitSector[];
  readonly fundTags: readonly unknown[];
  readonly marketPlaceName: string | null;
  readonly subType: string | null;
  readonly highlightedSubType: string | null;
}

export interface SearchResponse {
  readonly totalNumberOfHits: number;
  readonly hits: readonly SearchHit[];
  readonly searchQuery: string;
  readonly searchFilter: { readonly types: readonly SearchInstrumentType[] };
  readonly facets: {
    readonly types: readonly { readonly type: SearchInstrumentType; readonly count: number }[];
  };
  readonly pagination: { readonly from: number; readonly size: number };
}

export interface InstrumentByIsinResponse {
  readonly name: string;
  readonly orderbookId: string;
  readonly type: string;
}

export interface StockQuote {
  readonly buy: number | null;
  readonly sell: number | null;
  readonly last: number | null;
  readonly highest: number | null;
  readonly lowest: number | null;
  readonly change: number | null;
  readonly changePercent: number | null;
  readonly spread: number | null;
  readonly timeOfLast: number | null;
  readonly totalValueTraded: number | null;
  readonly totalVolumeTraded: number | null;
  readonly updated: number;
  readonly volumeWeightedAveragePrice: number | null;
  readonly isRealTime: boolean;
}

export interface OrderDepthSide {
  readonly price: number;
  readonly volume: number;
  readonly priceString: string;
}

export interface OrderDepthLevel {
  readonly buySide: OrderDepthSide | null;
  readonly sellSide: OrderDepthSide | null;
}

export interface OrderDepth {
  readonly receivedTime: number;
  readonly levels: readonly OrderDepthLevel[];
}

export interface MarketTrade {
  readonly buyer: string;
  readonly buyerName?: string;
  readonly seller: string;
  readonly sellerName?: string;
  readonly dealTime: number;
  readonly price: number;
  readonly volume: number;
  readonly matchedOnMarket: boolean;
  readonly cancelled: boolean;
}

export interface BrokerTradeSummary {
  readonly brokerCode: string;
  readonly brokerName: string;
  readonly buyVolume: number;
  readonly sellVolume: number;
  readonly netBuyVolume: number;
}

export interface InstrumentLink {
  readonly orderbookId: string;
  readonly type: string;
  readonly flagCode: string;
  readonly tradeStatus: string;
  readonly linkDisplay: string;
  readonly urlDisplayName: string;
  readonly shortLinkDisplay: string;
  readonly tradeable: boolean;
  readonly sellable: boolean;
  readonly buyable: boolean;
}

export interface HeaderIndex {
  readonly link: InstrumentLink;
  readonly quoteChangeToday: string;
  readonly todayChangeDirection: number;
  readonly todayPriceUpdated: string;
  readonly quoteChangeYear: string;
  readonly yearChangeDirection: number;
  readonly priceAtStartOfYear: string;
}

export interface HeaderIndicesResponse {
  readonly indexes: readonly HeaderIndex[];
}

export interface IndexConstituent {
  readonly name: string;
  readonly countryCode: string;
  readonly orderbookId: string;
  readonly changePercent: number | null;
}

export interface Listing {
  readonly shortName: string;
  readonly tickerSymbol: string;
  readonly countryCode: string;
  readonly currency: string;
  readonly marketPlaceCode: string;
  readonly marketPlaceName: string;
  readonly tickSizeListId: string;
  readonly marketTradesAvailable: boolean;
}

export interface EtfUnderlying {
  readonly orderbookId: string;
  readonly name: string;
  readonly instrumentType: string;
  readonly quote: Partial<StockQuote>;
  readonly listing: Listing;
  readonly previousClosingPrice: number | null;
}

export interface EtfResponse {
  readonly orderbookId: string;
  readonly name: string;
  readonly isin: string;
  readonly type: string;
  readonly tradable: string;
  readonly underlying: EtfUnderlying | null;
  readonly listing: Listing;
  readonly marketPlace: {
    readonly marketOpen: boolean;
    readonly timeLeftMs: number;
    readonly openingTime: string;
    readonly todayClosingTime: string;
    readonly normalClosingTime: string;
  };
  readonly historicalClosingPrices: Readonly<Record<string, number | string>>;
  readonly keyIndicators: {
    readonly direction: string;
    readonly leverage: number;
    readonly numberOfOwners: number;
    readonly historicYield?: number;
    readonly historicYieldDate?: string;
  };
  readonly quote: StockQuote;
}

export interface Exposures<Exposure> {
  readonly updated: string;
  readonly exposures: readonly Exposure[];
}

export interface EtfDetailsResponse {
  readonly underlying: EtfUnderlying | null;
  readonly assetCategory: string;
  readonly category: string;
  readonly subCategory: string;
  readonly issuer: string;
  readonly description: string;
  readonly documents: Readonly<Record<string, string>>;
  readonly orderDepth: OrderDepth;
  readonly brokerTradeSummaries: readonly BrokerTradeSummary[];
  readonly trades: readonly MarketTrade[];
  readonly tradingUnit: number;
  readonly collateralValue: number;
  readonly superInterestApproved: boolean;
  readonly introDate: string;
  readonly dividends: {
    readonly events: readonly unknown[];
    readonly pastEvents: readonly unknown[];
  };
  readonly fundExposures: readonly {
    readonly orderbookId: string | null;
    readonly name: string;
    readonly exposure: number;
    readonly instrumentType: string | null;
    readonly countryCode: string | null;
    readonly hasPosition: boolean;
  }[];
  readonly riskScore: string;
  readonly holdingPeriod: string;
  readonly countryExposures: Exposures<{
    readonly countryCode: string;
    readonly countryName: string;
    readonly weight: number;
  }>;
  readonly sectorExposures: Exposures<{ readonly sector: string; readonly weight: number }>;
  readonly portfolioDate: string;
  readonly esgView: unknown;
}

export interface MarketOverviewWidget {
  readonly type: string;
  readonly name: string;
  readonly configuration: unknown;
  readonly data: unknown;
  readonly settings: unknown;
  readonly position: { readonly x: number; readonly y: number };
}

export interface MarketOverview {
  readonly id: string | null;
  readonly title: string;
  readonly active: boolean;
  readonly layoutMode: string;
  readonly widgets: readonly MarketOverviewWidget[];
  readonly generation: number;
  readonly hasMap: boolean;
}

export const chartPeriods = [
  'today',
  'one_week',
  'one_month',
  'three_months',
  'this_year',
  'one_year',
  'three_years',
  'five_years',
  'infinity',
] as const;

export type ChartPeriod = (typeof chartPeriods)[number];

export interface ChartPeriodChange {
  readonly timePeriod: ChartPeriod;
  readonly change: number | null;
  readonly startDate: string | null;
}

export interface OverviewChartResponse {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly dataSerie: readonly { readonly x: number; readonly y: number }[];
  readonly orderbook: {
    readonly orderbookId: string;
    readonly name: string;
    readonly currency: string;
    readonly countryCode: string;
    readonly instrumentType: string;
    readonly instrumentSubType: string | null;
    readonly closingPrice: number | null;
    readonly priceThreeMonthsAgo: number | null;
    readonly priceStartOfYear: number | null;
    readonly lastPrice: number | null;
    readonly updated: number;
  };
}

export const chartResolutions = [
  'minute',
  'two_minutes',
  'five_minutes',
  'ten_minutes',
  'thirty_minutes',
  'hour',
  'day',
  'week',
  'month',
  'quarter',
] as const;

export type ChartResolution = (typeof chartResolutions)[number];

/** A named period or a custom `yyyy-MM-dd` range. */
export type PriceChartPeriod = ChartPeriod | PerformanceDateRange;

export interface PriceChartOptions {
  /** Available resolutions depend on the period; see `metadata.resolution`. */
  readonly resolution?: ChartResolution | undefined;
}

export interface Ohlc {
  readonly timestamp: number;
  readonly open: number;
  readonly close: number;
  readonly low: number;
  readonly high: number;
  readonly totalVolumeTraded: number;
}

export interface PriceChartResponse {
  readonly ohlc: readonly Ohlc[];
  readonly metadata: {
    readonly resolution: {
      readonly chartResolution: ChartResolution;
      readonly availableResolutions: readonly ChartResolution[];
    };
  };
  readonly from: string;
  readonly to: string;
  readonly previousClosingPrice: number | null;
}

export interface CompanyEvent {
  readonly eventType: string;
  readonly timestamp: number;
}

export interface InsiderTransactionSummary {
  readonly timestamp: number;
  readonly buyCount: number;
  readonly sellCount: number;
  readonly netChange: number;
  readonly currencyCode: string;
}

export interface MarketDataResponse {
  readonly quote: Omit<StockQuote, 'isRealTime' | 'spread' | 'timeOfLast' | 'updated'> & {
    readonly timeOfLast: string | null;
    readonly updated: string;
  };
  readonly orderDepth: OrderDepth & { readonly marketMakerExpected: boolean };
  readonly trades: readonly MarketTrade[];
}

export interface ShortSellingPoint {
  readonly timestamp: number;
  readonly ratio: number;
}

export interface ShortSellingResponse {
  readonly shortSellingHistory: readonly ShortSellingPoint[];
}

export interface MoneyAmount {
  readonly value: number;
  readonly currency: string;
}

export interface MarketplaceStatus {
  readonly marketOpen: boolean;
  readonly timeLeftMs: number;
  readonly openingTime: string;
  readonly todayClosingTime: string;
  readonly normalClosingTime: string;
  /** For example `OPEN` or `CLOSED`. */
  readonly currentStatus: string;
  readonly marketStateSchedule: readonly {
    readonly status: string;
    readonly start: string;
    readonly end: string;
  }[];
}

/** Closing prices at the start of each period; missing periods are omitted. */
export type HistoricalClosingPrices = Readonly<Record<string, number | string>>;

export interface CompanyReport {
  readonly date: string;
  readonly reportType: string;
  readonly isConfirmed: boolean;
}

export interface StockInfo {
  readonly orderbookId: string;
  readonly name: string;
  readonly isin: string;
  readonly instrumentId: string;
  readonly type: string;
  readonly tradable: string;
  readonly sectors: readonly { readonly sectorId: string; readonly sectorName: string }[];
  readonly listing: Listing & { readonly marketListName?: string };
  readonly marketPlace: MarketplaceStatus;
  readonly historicalClosingPrices: HistoricalClosingPrices;
  readonly keyIndicators: {
    readonly numberOfOwners: number;
    readonly reportDate: string;
    readonly volatility?: number;
    readonly beta?: number;
    readonly priceEarningsRatio?: number;
    readonly priceSalesRatio?: number;
    readonly priceBookRatio?: number;
    readonly evEbitRatio?: number;
    readonly directYield?: number;
    readonly ordinaryDirectYield?: number;
    readonly totalDirectYield?: number;
    readonly shortSellingRatio?: number;
    readonly returnOnEquity?: number;
    readonly returnOnTotalAssets?: number;
    readonly returnOnCapitalEmployed?: number;
    readonly equityRatio?: number;
    readonly capitalTurnover?: number;
    readonly interestCoverageRatio?: number;
    readonly operatingProfitMargin?: number;
    readonly grossMargin?: number;
    readonly netMargin?: number;
    readonly dividendsPerYear?: number;
    readonly marketCapital?: MoneyAmount;
    readonly equityPerShare?: MoneyAmount;
    readonly turnoverPerShare?: MoneyAmount;
    readonly earningsPerShare?: MoneyAmount;
    readonly operatingCashFlow?: MoneyAmount;
    readonly dividend?: {
      readonly exDate: string;
      readonly paymentDate?: string;
      readonly amount: number;
      readonly currencyCode: string;
      readonly exDateStatus: string;
    };
    readonly nextReport?: CompanyReport;
    readonly previousReport?: CompanyReport;
  };
  readonly quote: StockQuote;
}

export interface AnalysisPoint {
  /** For example `FULL_YEAR` or `Q1`. */
  readonly reportType: string;
  readonly financialYear: number;
  /** Report date; present on quarterly series and dividends. */
  readonly date?: string;
  readonly value: number;
}

/** Metric name, for example `priceEarningsRatio` or `sales`, to its series. */
export type AnalysisSeries = Readonly<Record<string, readonly AnalysisPoint[]>>;

export type AnalysisSummary = Readonly<
  Record<string, { readonly latest: number | null; readonly average: number | null }>
>;

/**
 * `ByQuarterTTM` series are trailing twelve months; `ByQuarterQuarter`
 * series cover the single quarter.
 */
export interface StockAnalysis {
  readonly stockKeyRatiosByYear: AnalysisSeries;
  readonly stockKeyRatiosByQuarter: AnalysisSeries;
  readonly stockKeyRatiosByQuarterTTM: AnalysisSeries;
  readonly stockKeyRatiosByQuarterQuarter: AnalysisSeries;
  readonly companyKeyRatiosByYear: AnalysisSeries;
  readonly companyKeyRatiosByQuarter: AnalysisSeries;
  readonly companyKeyRatiosByQuarterTTM: AnalysisSeries;
  readonly companyKeyRatiosByQuarterQuarter: AnalysisSeries;
  readonly dividendsByYear: AnalysisSeries;
  readonly companyFinancialsByYear: AnalysisSeries;
  readonly companyFinancialsByQuarter: AnalysisSeries;
  readonly companyFinancialsByQuarterTTM: AnalysisSeries;
  readonly companyFinancialsByQuarterQuarter: AnalysisSeries;
  readonly keyRatiosByYear: AnalysisSummary;
  readonly keyRatiosByQuarter: AnalysisSummary;
  readonly keyRatiosByQuarterTTM: AnalysisSummary;
  readonly keyRatiosByQuarterQuarter: AnalysisSummary;
}

export interface EstimatePoint {
  /** For example `FULL_YEAR` or `Q1`. */
  readonly reportPeriod: string;
  readonly financialYear: number;
  /** Report date; present on quarterly series. */
  readonly date?: string;
  /** Reported value; absent on future periods. */
  readonly value?: number;
  /** Analyst consensus estimate; present on future periods. */
  readonly estimate?: number;
  readonly onlyEstimate: boolean;
}

/** Metric name, for example `priceEarningsRatio` or `sales`, to its series. */
export type EstimateSeries = Readonly<Record<string, readonly EstimatePoint[]>>;

/** Like {@link StockAnalysis}, with analyst estimates for coming periods. */
export interface StockEstimates {
  readonly stockKeyRatiosByYear: EstimateSeries;
  readonly stockKeyRatiosByQuarterTTM: EstimateSeries;
  readonly stockKeyRatiosByQuarterQuarter: EstimateSeries;
  readonly companyKeyRatiosByYear: EstimateSeries;
  readonly companyKeyRatiosByQuarterTTM: EstimateSeries;
  readonly companyKeyRatiosByQuarterQuarter: EstimateSeries;
  readonly dividendsByYear: EstimateSeries;
  readonly companyFinancialsByYear: EstimateSeries;
  readonly companyFinancialsByQuarterTTM: EstimateSeries;
  readonly companyFinancialsByQuarterQuarter: EstimateSeries;
  readonly keyRatiosByYear: AnalysisSummary;
  readonly keyRatiosByQuarterTTM: AnalysisSummary;
  readonly keyRatiosByQuarterQuarter: AnalysisSummary;
}

export interface SectorIndicator {
  /** For example `earningsPerShare` or `priceEarningsRatio`. */
  readonly key: string;
  readonly label: string;
  readonly snapshot: { readonly latest: number | null; readonly average: number | null };
  readonly historical: readonly EstimatePoint[];
}

/** Key ratios for the stock's sector. */
export interface SectorAnalysis {
  readonly sectorId: string;
  readonly sectorName: string;
  readonly indicators: readonly SectorIndicator[];
}

export interface AnalystRecommendations {
  readonly date: string;
  readonly numberOfOutperform: number;
  readonly numberOfBuy: number;
  readonly numberOfHold: number;
  readonly numberOfUnderperform: number;
  readonly numberOfSell: number;
  /** For example `BUY`, `OUTPERFORM`, or `HOLD`. */
  readonly consensusAction: string;
  /** For example `HOLD` or `UNKNOWN`. */
  readonly industryConsensusAction: string;
}

export interface PriceTargets {
  readonly date: string;
  readonly lowPriceTarget: number;
  readonly averagePriceTarget: number;
  readonly highPriceTarget: number;
  readonly numberOfEstimates: number;
}

export interface EstimateHistory {
  readonly recommendations: readonly AnalystRecommendations[];
  readonly priceTargets: readonly PriceTargets[];
}

export interface MorningstarAnalysis {
  /** PDF report URL. */
  readonly documentUrl: string;
  readonly documentId: string;
  readonly documentPublishedDate: string;
  readonly fairValue: {
    readonly financialValue: string;
    readonly currency: string;
    readonly published: string;
  };
  /** Economic moat, for example `Narrow` or `Wide`. */
  readonly moat: { readonly value: string };
  readonly bullBear: {
    readonly bulls: readonly string[];
    readonly bears: readonly string[];
    readonly published: string;
    readonly author: { readonly byLine: string; readonly jobTitle: string };
  };
}

export interface MorningstarAnalysisResponse {
  /** `null` when Morningstar does not cover the stock. */
  readonly morningstar: MorningstarAnalysis | null;
}

/**
 * Placera is open to all customers; Affärsvärlden needs a linked subscription
 * and Kepler Cheuvreux Private Banking or Pro to read the full analyses.
 */
export const analysisProviders = ['placera', 'afv', 'kepler'] as const;

export type AnalysisProvider = (typeof analysisProviders)[number];

/** Which gated providers the customer can read. */
export interface AnalysisAccess {
  readonly afv: boolean;
  readonly kepler: boolean;
  readonly platina: boolean;
}

export interface AnalysisSummaryItem {
  readonly analysisId: string;
  readonly orderbookId: string;
  /** `name`, `countryCode`, and `currency` are absent from single-stock responses. */
  readonly name?: string;
  readonly countryCode?: string;
  readonly currency?: string;
  readonly lastPrice?: number;
  readonly priceAtPublish?: number;
  readonly hasPosition: boolean;
  /** `ANALYSIS` or `COMMENT`; Affärsvärlden and Kepler only. */
  readonly analysisType?: string;
  readonly title?: string;
  readonly points?: readonly string[];
  readonly authors: readonly string[];
  /** Article URL; Placera only. */
  readonly link?: string;
  readonly published: string;
}

export interface AnalysisFilter {
  /** Defaults to 0. */
  readonly offset?: number | undefined;
  /** Defaults to 20. */
  readonly limit?: number | undefined;
  /** Matches the instrument name. */
  readonly name?: string | undefined;
  /** Sector values from `filterOptions.sectors`. */
  readonly sectors?: readonly string[] | undefined;
  /** Market values from `filterOptions.countryMarketList`, for example `se/xsto`. */
  readonly countryMarkets?: readonly string[] | undefined;
  /** For example `buy`, `hold`, or `reduce`. */
  readonly recommendations?: readonly string[] | undefined;
}

export interface FilteredAnalysis {
  readonly analysisId: string;
  readonly orderbookId: string;
  readonly name: string;
  readonly countryCode: string;
  readonly marketPlaceCode: string;
  readonly currency: string;
  readonly lastPrice?: number;
  readonly priceAtPublish?: number;
  readonly publishDate: string;
  readonly publishChangeRatio?: number;
  readonly hasPosition: boolean;
  readonly title?: string;
  readonly link?: string;
}

export interface AnalysisFilterOption {
  readonly value: string;
  readonly displayName: string;
  readonly numberOfOrderbooks: string;
  readonly children?: readonly AnalysisFilterOption[];
}

export interface FilteredAnalysesResponse {
  readonly analyses: readonly FilteredAnalysis[];
  readonly offset: number;
  readonly limit: number;
  readonly totalCount: number;
  readonly filterOptions: {
    readonly countryMarketList: readonly AnalysisFilterOption[];
    readonly sectors: readonly AnalysisFilterOption[];
    readonly recommendations: readonly AnalysisFilterOption[];
  };
  readonly sortBy: { readonly field: string; readonly order: string };
}

export interface NumberOfOwnersResponse {
  readonly ownersPoints: readonly { readonly timestamp: number; readonly numberOfOwners: number }[];
  readonly historySummary: {
    readonly oneYearChange: number;
    readonly oneYearChangePercent: number;
    readonly thisYearChange: number;
    readonly thisYearChangePercent: number;
  };
}

export const listedInstrumentTypes = ['certificate', 'warrant', 'futureforward', 'option'] as const;

export type ListedInstrumentType = (typeof listedInstrumentTypes)[number];

export interface InstrumentUnderlying {
  readonly orderbookId: string;
  readonly name: string;
  readonly instrumentType: string;
  readonly instrumentSubType: string;
  readonly quote: Partial<StockQuote>;
  readonly listing: Listing;
  readonly previousClosingPrice: number | null;
  readonly reference: boolean;
}

export interface ListedInstrument {
  readonly orderbookId: string;
  readonly name: string;
  readonly isin: string;
  readonly type: string;
  readonly tradable: string;
  readonly listing: Listing;
  readonly historicalClosingPrices: HistoricalClosingPrices;
  /**
   * Product-specific, for example `leverage` and `productLink` (certificates),
   * `barrierLevel` and `financingLevel` (warrants), or `strikePrice`,
   * `callIndicator`, and `endDate` (options).
   */
  readonly keyIndicators: { readonly numberOfOwners: number } & Readonly<
    Record<string, boolean | number | string>
  >;
  readonly quote: Partial<StockQuote>;
  readonly underlying?: InstrumentUnderlying;
  readonly assetCategory?: string;
  readonly category?: string;
  readonly subCategory?: string;
}

export interface ListedInstrumentDetails {
  readonly issuer?: string;
  readonly direction?: string;
  readonly leverage?: number;
  readonly exerciseType?: string;
  readonly underlying?: InstrumentUnderlying;
  readonly documents: { readonly kid?: string; readonly prospectus?: string };
  readonly orderDepth: OrderDepth & {
    readonly marketMakerLevelInBid?: number;
    readonly marketMakerLevelInAsk?: number;
  };
  readonly trades: readonly MarketTrade[];
  readonly brokerTradeSummaries: readonly BrokerTradeSummary[];
  readonly collateralValue: number;
  readonly tradingUnit?: number;
  readonly superInterestApproved?: boolean;
}

export interface MarketMakerChartResponse {
  readonly ohlc: readonly Ohlc[];
  readonly marketMaker: readonly {
    readonly timestamp: number;
    readonly buy: number | null;
    readonly sell: number | null;
  }[];
  readonly metadata: PriceChartResponse['metadata'];
  readonly from: string;
  readonly to: string;
}

export interface InstrumentNewsArticle {
  readonly headline: string;
  readonly vignette: string;
  readonly intro: string;
  readonly articleType: string;
  readonly category: string;
  readonly newsSource: string;
  readonly fullArticleLink: string;
  readonly externalLink: boolean;
  readonly timePublished: string;
  readonly timePublishedMillis: number;
}

export interface InstrumentNewsResponse {
  readonly articles: readonly InstrumentNewsArticle[];
}

export interface InsiderTrade {
  readonly orderbookId: string;
  readonly ticker: string;
  readonly instrumentType: string;
  readonly instrumentDescription: string | null;
  readonly marketCountryCode: string;
  readonly insiderName: string;
  readonly insiderPosition: string;
  readonly owner: string | null;
  readonly newHolder: string | null;
  /** For example `BUY` or `SELL`. */
  readonly transactionType: string;
  readonly transactionDate: string;
  readonly reportedDate: string;
  readonly price: number;
  readonly quantity: number;
  readonly totalValue: number;
  readonly currency: string;
  readonly ownershipChangeFraction: number | null;
  readonly marketTransaction: boolean;
  readonly equityProgram: boolean;
  readonly aggregatedTransaction: boolean;
}

export interface InsiderTradesResponse {
  readonly transactions: readonly InsiderTrade[];
  readonly source: string;
  readonly buyCount: number | null;
  readonly buyTotalValue: number | null;
  readonly sellCount: number | null;
  readonly sellTotalValue: number | null;
  readonly allocationTotalValue: number | null;
}
