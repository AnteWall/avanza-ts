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
}
