export interface PriceChartResponse {
  ohlc: PriceChartOHLC[];
  metadata: PriceChartMetadata;
  from: string;
  to: string;
  previousClosingPrice: number;
}

export enum PriceChartResolution {
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
}

export enum PriceChartTimePeriod {
  TODAY = "today",
  ONE_WEEK = "one_week",
  ONE_MONTH = "one_month",
  THREE_MONTHS = "three_months",
  SIX_MONTHS = "six_months",
  THIS_YEAR = "this_year",
  ONE_YEAR = "one_year",
  THREE_YEARS = "three_years",
  FIVE_YEARS = "five_years",
  INFINITY = "infinity",
}

export interface Root {
  ohlc: PriceChartOHLC[];
  metadata: PriceChartMetadata;
  from: string;
  to: string;
  previousClosingPrice: number;
}

export interface PriceChartOHLC {
  timestamp: number;
  open: number;
  close: number;
  low: number;
  high: number;
  totalVolumeTraded: number;
}

export interface PriceChartMetadata {
  resolution: PriceChartResolutionData;
}

export interface PriceChartResolutionData {
  chartResolution: string;
  availableResolutions: string[];
}
