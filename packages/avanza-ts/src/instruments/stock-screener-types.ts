export interface StockFilterRange {
  readonly minValue?: number | undefined;
  readonly maxValue?: number | undefined;
  readonly [key: string]: unknown;
}

export interface StockFilter {
  readonly sectors?: readonly string[] | undefined;
  readonly marketPlaces?: readonly string[] | undefined;
  readonly countryCodes?: readonly string[] | undefined;
  readonly marketPlaceCodes?: readonly string[] | undefined;
  readonly nameQuery?: string | undefined;
  readonly numberOfOwners?: StockFilterRange | undefined;
  readonly priceEarningsRatio?: StockFilterRange | undefined;
  readonly marketCapitalization?: StockFilterRange | undefined;
  readonly onlyDirectYield?: boolean | undefined;
  readonly onlyHasAnalysis?: boolean | undefined;
  readonly onlySuperloanApproved?: boolean | undefined;
  readonly [key: string]: unknown;
}

export interface StockSort {
  readonly field: string;
  readonly order: 'asc' | 'desc';
}

export interface ScreenStocksOptions {
  readonly filter?: StockFilter;
  readonly offset?: number;
  readonly limit?: number;
  readonly sortBy?: StockSort;
  readonly signal?: AbortSignal;
}

export interface StockFilterOption {
  readonly value: string;
  readonly displayName: string;
  readonly numberOfOrderbooks: string;
  readonly children?: readonly StockFilterOption[] | undefined;
}

export interface StockFilterOptions {
  readonly countryCodes: readonly StockFilterOption[];
  readonly marketPlaces: readonly StockFilterOption[];
  readonly sectors: readonly StockFilterOption[];
}

export type StockMetric =
  | 'directYield'
  | 'priceEarningsRatio'
  | 'lastPrice'
  | 'highestPrice'
  | 'lowestPrice'
  | 'buyPrice'
  | 'sellPrice'
  | 'totalValueTraded'
  | 'totalVolumeTraded'
  | 'lastPriceUpdated'
  | 'oneDayChangePercent'
  | 'oneWeekChangePercent'
  | 'startOfYearChangePercent'
  | 'oneYearChangePercent'
  | 'oneMonthChangePercent'
  | 'threeMonthsChangePercent'
  | 'sixMonthsChangePercent'
  | 'threeYearsChangePercent'
  | 'fiveYearsChangePercent'
  | 'tenYearsChangePercent'
  | 'infinityChangePercent'
  | 'numberOfOwners'
  | 'shortSellingRatio'
  | 'evEbitRatio'
  | 'netDebtEbitdaRatio'
  | 'pricePerSaleRatio'
  | 'priceSalesRatio'
  | 'returnOnEquity'
  | 'returnOnAssets'
  | 'returnOnCapitalEmployed'
  | 'priceBookRatio'
  | 'earningsPerShare'
  | 'dividendPerShare'
  | 'equityPerShare'
  | 'dividendRatio'
  | 'turnoverPerShare'
  | 'marketCapitalization'
  | 'marketCap'
  | 'beta'
  | 'volatility'
  | 'sma20'
  | 'sma50'
  | 'sma200'
  | 'smaBetween50and200'
  | 'rsi14'
  | 'rsiTrendThreeDays'
  | 'rsiTrendFiveDays'
  | 'bollingerDistanceUpperToLower'
  | 'bollingerDistanceUpper'
  | 'bollingerDistanceLower'
  | 'collateralValue'
  | 'dividendsPerYear'
  | 'debtToEquityRatio'
  | 'profitMargin'
  | 'sales'
  | 'totalAssets'
  | 'totalLiabilities'
  | 'netProfit'
  | 'ownersChangeOneDay'
  | 'ownersChangeOneWeek'
  | 'ownersChangeOneMonth'
  | 'ownersChangeThreeMonths'
  | 'ownersChangeThisYear'
  | 'ownersChangeOneYear'
  | 'ownersChangeOneDayAbsolute'
  | 'ownersChangeOneWeekAbsolute'
  | 'ownersChangeOneMonthAbsolute'
  | 'ownersChangeThreeMonthsAbsolute'
  | 'ownersChangeThisYearAbsolute'
  | 'ownersChangeOneYearAbsolute'
  | 'macdValue'
  | 'macdHistogram'
  | 'macdSignal'
  | 'operatingCashFlow';

export interface ScreenedStock extends Readonly<Partial<Record<StockMetric, number | undefined>>> {
  readonly orderbookId: string;
  readonly companyId: string;
  readonly type: string;
  readonly name: string;
  readonly shortName: string;
  readonly currency: string;
  readonly countryCode: string;
  readonly marketPlaceCode: string;
  readonly hasPosition?: boolean | undefined;
  readonly hasAnalysis?: boolean | undefined;
  readonly nextCompanyReport?: string | undefined;
  readonly nextDividend?: string | undefined;
  readonly [key: string]: unknown;
}

export interface ScreenStocksResponse {
  readonly stocks: readonly ScreenedStock[];
  readonly filter: StockFilter;
  readonly pagination: { readonly offset: number; readonly limit: number };
  readonly sortBy: StockSort;
  readonly totalNumberOfOrderbooks: number;
  readonly filterOptions: StockFilterOptions;
}

export interface StockScreenerTab {
  readonly name: string;
  readonly columns: readonly string[];
}

export interface StockScreenerTabsResponse {
  readonly tabs: readonly StockScreenerTab[];
}

export interface SavedStockFilter {
  readonly name: string;
  readonly filter: StockFilter;
}

export interface SavedStockFiltersResponse {
  readonly filters: readonly SavedStockFilter[];
}

export interface StockScreenerMetadataResponse {
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface StockSector {
  readonly sectorId: string;
  readonly sectorName: string;
}

export interface PopularStockSector extends StockSector {
  readonly illustrationName: string;
}

export interface StockSectorGroup {
  readonly sector: StockSector;
  readonly children: readonly StockSector[];
}
