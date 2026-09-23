export interface Watchlist {
  readonly watchListId: string;
  readonly name: string;
  readonly customerId: { readonly id: number };
  readonly orderbookIds: readonly string[];
  readonly watchListItems: readonly { readonly orderbookId: string }[];
  readonly created: string;
  readonly modified: string;
}

/** Data points the web app can request for watchlist rows. */
export const watchlistDataPoints = [
  'ABSOLUTE_PERFORMANCE_SINCE_ADDED',
  'BETA',
  'BUY_OR_SELL',
  'BUY_PRICE',
  'CATEGORY',
  'CHANGE',
  'CHANGE_PERCENTAGE',
  'COLLATERAL_FACTOR',
  'CURRENCY',
  'DATE_WHEN_ADDED',
  'DIRECTION',
  'DIVIDENDS_AMOUNT_12_MONTHS',
  'DIVIDENDS_PER_YEAR',
  'EARNINGS_PER_SHARE',
  'END_DATE',
  'ETF_ORDINARY_DIRECT_YIELD',
  'ETF_RISK',
  'EV_EBIT_RATIO',
  'FIVE_YEARS_PERFORMANCE',
  'FLAG_CODE',
  'FUND_RATING',
  'FUND_RISK',
  'FUND_TOTAL_MARKET_VALUE',
  'HIGHEST_PRICE',
  'INSTRUMENT_TYPE',
  'LAST_PRICE',
  'LEVERAGE',
  'LOWEST_PRICE',
  'MANAGEMENT_FEE',
  'MARGIN_REQUIREMENT',
  'MARKET_CAP',
  'MAX_PERFORMANCE',
  'NAME',
  'NAV',
  'NET_DEBT_TO_EBITDA_RATIO',
  'NEXT_DIVIDEND_AMOUNT',
  'NEXT_DIVIDEND_DATE',
  'NEXT_REPORT_DATE',
  'NUMBER_OF_OWNERS',
  'ONE_MONTH_PERFORMANCE',
  'ONE_WEEK_PERFORMANCE',
  'ONE_YEAR_PERFORMANCE',
  'OPTION_TYPE',
  'ORDINARY_DIRECT_YIELD',
  'PRICE_BOOK_RATIO',
  'PRICE_EARNINGS_RATIO',
  'PRICE_LAST_UPDATED_DATE',
  'PRICE_LAST_UPDATED_TIME',
  'PRICE_SALES_RATIO',
  'PRICE_WHEN_ADDED',
  'PRODUCT_FEE',
  'RELATIVE_PERFORMANCE_SINCE_ADDED',
  'RETURN_ON_EQUITY',
  'SELL_PRICE',
  'SHARPE_RATIO',
  'SHORT_SELLING_ALLOWED',
  'SIX_MONTHS_PERFORMANCE',
  'SPREAD',
  'STANDARD_DEVIATION_PERCENT',
  'STRIKE_PRICE',
  'SUPER_INTEREST_APPROVED',
  'TEN_YEARS_PERFORMANCE',
  'THIS_YEAR_PERFORMANCE',
  'THREE_MONTHS_PERFORMANCE',
  'THREE_YEARS_PERFORMANCE',
  'TOTAL_FEE',
  'UNDERLYING_INSTRUMENT_NAME',
  'VALUE_TRADED',
  'VOLATILITY',
  'VOLUME_TRADED',
  'WARRANT_LEVERAGE',
  'WARRANT_TYPE',
] as const;

export type WatchlistDataPoint = (typeof watchlistDataPoints)[number];

export interface WatchlistOrderbook {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly isin: string;
  readonly instrumentId: string;
  readonly instrumentType: string;
  readonly currency: string;
  readonly flagCode: string;
  readonly tradable: boolean;
  readonly buyable: boolean;
  readonly sellable: boolean;
}

/** Sections other than `quote` and `tools` depend on the requested data points. */
export interface WatchlistRow extends WatchlistOrderbook {
  readonly quote: {
    readonly change: number;
    readonly changePercent: number;
    readonly lastPrice: number;
    readonly closingPrice: number;
    readonly highestPrice: number;
    readonly lowestPrice: number;
    readonly buyPrice: number;
    readonly sellPrice: number;
    readonly spread: number;
    readonly totalVolumeTraded: number;
    readonly totalValueTraded: number;
    readonly lastPriceUpdated: string;
    readonly updated: string;
  };
  /** For example `numberOfOwners`, `priceEarningsRatio`, or `nextDividendDate`. */
  readonly keyIndicators: Readonly<Record<string, boolean | number | string>>;
  /** Change in percent keyed by period, for example `ONE_YEAR`. */
  readonly performance?: Readonly<Record<string, number>>;
  readonly tools: { readonly hasAlert: boolean; readonly hasNote: boolean };
  readonly dateWhenAdded?: string;
  readonly priceWhenAdded?: number;
}

export interface WatchlistNewsOptions {
  readonly categories?: readonly string[] | undefined;
}

export interface WatchlistNewsItem {
  readonly title: string;
  readonly vignette: string;
  readonly teaser: string;
  readonly category: string;
  readonly sourceName: string;
  /** Pass to `NewsClient.article()` for the full article. */
  readonly url: string;
  readonly publishDateTime: string;
  readonly orderbooks: readonly WatchlistOrderbook[];
}

export interface WatchlistNewsResponse {
  readonly news: readonly WatchlistNewsItem[];
  readonly currentDateTime: string;
}

/**
 * Alert item fields follow the web app's model; captured responses had no
 * alerts yet. `messageTypes` contains `EMAIL` and/or `PUSH_NOTIFICATION`.
 */
export type Alert = { readonly messageTypes: readonly string[] } & Readonly<
  Record<string, unknown>
>;

export interface AlertsResponse {
  readonly priceAlerts: readonly Alert[];
  readonly percentAlerts: readonly Alert[];
  readonly newsAlerts: readonly Alert[];
}

export interface Note {
  readonly noteId: string;
  readonly orderbookId: string;
  readonly text: string;
  readonly color: string;
  readonly createdDate: string;
  readonly reminderDate?: string | null;
  readonly originalPrice: number;
  readonly lastPrice: number;
  readonly priceDevelopmentPercentage: number;
  readonly currency: string;
  readonly instrumentName: string;
  readonly instrumentType: string;
  readonly countryCode: string;
}

export interface NoteOrderbook {
  readonly orderbookId: string;
  readonly instrumentName: string;
}
