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
