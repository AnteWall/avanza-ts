import { InstrumentType } from "./types";

export interface TopHit {
  currency: string;
  lastPrice: number;
  changePercent: number;
  flagCode: string;
  tradable: boolean;
  tickerSymbol: string;
  name: string;
  id: string;
}

export interface Hit {
  link: Link;
  currency: string;
  lastPrice: string;
  todayChange: string;
  todayChangeDirection: string;
  todayChangeValue: string;
  oneQuarterAgoPrice: string;
  oneQuarterAgoChange: string;
  oneQuarterAgoChangeDirection: string;
  highlightedDisplayTitle: string;
  fundResult: string;
}

export interface Link {
  type: InstrumentType;
  flagCode: string;
  orderbookId: string;
  urlDisplayName: string;
  linkDisplay: string;
  shortLinkDisplay: string;
  tradeable: boolean;
  sellable: boolean;
  buyable: boolean;
}

export interface PageSearchResults {
  totalNumberOfHits: number;
  numberOfHits: number;
  hits: Hit[];
}

export interface SearchResponse {
  totalNumberOfHits: number;
  numberOfHits: number;
  pageSearchResults: PageSearchResults;
  searchQuery: string;
  urlEncodedSearchQuery: string;
  configurationResponse: any;
  resultGroups: ResultGroup[];
}

export interface ResultGroup {
  instrumentType: string;
  numberOfHits: number;
  hits: Hit[];
  instrumentName: string;
  instrumentDisplayName: string;
}

export interface InstrumentResponse {
  orderbookId: string;
  name: string;
  isin: string;
  sectors: Sector[];
  tradable: string;
  listing: Listing;
  historicalClosingPrices: HistoricalClosingPrices;
  keyIndicators: KeyIndicators;
  quote: { [key: string]: number };
  type: string;
}

export interface HistoricalClosingPrices {
  oneDay: number;
  oneWeek: number;
  oneMonth: number;
  threeMonths: number;
  startOfYear: number;
  oneYear: number;
  threeYears: number;
  fiveYears: number;
  tenYears: number;
  start: number;
  startDate: string;
}

export interface KeyIndicators {
  numberOfOwners: number;
  reportDate: string;
  directYield: number;
  volatility: number;
  beta: number;
  priceEarningsRatio: number;
  priceSalesRatio: number;
  returnOnEquity: number;
  returnOnTotalAssets: number;
  equityRatio: number;
  capitalTurnover: number;
  operatingProfitMargin: number;
  grossMargin: number;
  netMargin: number;
  marketCapital: PriceValue;
  equityPerShare: PriceValue;
  turnoverPerShare: PriceValue;
  earningsPerShare: PriceValue;
  dividend: Dividend;
  dividendsPerYear: number;
  previousReport: PreviousReport;
}

export interface Dividend {
  exDate: string;
  paymentDate: string;
  amount: number;
  currencyCode: string;
  exDateStatus: string;
}

export interface PriceValue {
  value: number;
  currency: string;
}

export interface PreviousReport {
  date: string;
  reportType: string;
}

export interface Listing {
  shortName: string;
  tickerSymbol: string;
  countryCode: string;
  currency: string;
  marketPlaceCode: string;
  marketPlaceName: string;
  tickSizeListId: string;
  marketTradesAvailable: boolean;
}

export interface Sector {
  sectorId: string;
  sectorName: string;
}

export interface CompanyEvents {
  events: Event[];
}

export interface Event {
  date: string;
  type: string;
}

export interface InstrumentDetailsResponse {
  stock: Stock;
  company: Company;
  companyEvents: CompanyEvents;
  companyOwners: CompanyOwners;
  brokerTradeSummaries: BrokerTradeSummary[];
  dividends: Dividends;
  tradingTerms: TradingTerms;
  fundExposures: FundExposure[];
  trades: Trade[];
  orderDepthLevels: OrderDepthLevel[];
}

export interface Stock {
  preferred: boolean;
  depositaryReceipt: boolean;
  numberOfShares: number;
}

export interface Company {
  companyId: string;
  description: string;
  ceo: string;
  chairman: string;
  totalNumberOfShares: number;
  homepage: string;
}
export interface CompanyOwners {
  owners: any[];
}

export interface BrokerTradeSummary {
  brokerCode: string;
  sellVolume: number;
  buyVolume: number;
  netBuyVolume: number;
  brokerName: string;
}

export interface Dividends {
  events: any[];
  pastEvents: PastEvent[];
}

export interface PastEvent {
  exDate: string;
  paymentDate: string;
  amount: number;
  currencyCode: string;
  dividendType: string;
}

export interface TradingTerms {
  collateralValue: number;
  marginRequirement: number;
  shortSellable: boolean;
  superInterestApproved: boolean;
}

export interface FundExposure {
  orderbookId: string;
  name: string;
  exposure: number;
  countryCode: string;
  hasPosition: boolean;
}

export interface Trade {
  buyer: string;
  seller: string;
  dealTime: number;
  price: number;
  volume: number;
  matchedOnMarket: boolean;
  cancelled: boolean;
}

export interface OrderDepthLevel {
  buySide: BuySide;
  sellSide: SellSide;
}

export interface BuySide {
  price: number;
  priceString: string;
  volume: number;
}

export interface SellSide {
  price: number;
  priceString: string;
  volume: number;
}
