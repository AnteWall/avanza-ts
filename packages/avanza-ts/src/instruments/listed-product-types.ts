import type { StockSort } from './stock-screener-types.js';

/** Filter keys and values come from the matching `filter-options` response. */
export type ListedProductFilter = Readonly<Record<string, boolean | string | readonly string[]>>;

export interface ScreenListedProductsOptions {
  readonly filter?: ListedProductFilter;
  readonly offset?: number;
  readonly limit?: number;
  readonly sortBy?: StockSort;
  readonly signal?: AbortSignal;
}

export interface ListedProductFilterOption {
  readonly value: string;
  readonly displayName: string;
  readonly numberOfOrderbooks: number;
  readonly children?: readonly ListedProductFilterOption[];
}

export type ListedProductFilterOptions = Readonly<
  Record<string, readonly ListedProductFilterOption[]>
>;

export type ScreenListedProductsResponse<Key extends string, Item> = {
  readonly [K in Key]: readonly Item[];
} & {
  readonly filter: ListedProductFilter;
  readonly filterOptions: ListedProductFilterOptions;
  readonly pagination: { readonly offset: number; readonly limit: number };
  readonly sortBy: StockSort;
  readonly totalNumberOfOrderbooks: number;
};

export interface UnderlyingInstrument {
  readonly name: string;
  readonly orderbookId: string;
  readonly instrumentType: string;
  readonly countryCode: string;
}

export interface ScreenedEtf {
  readonly orderbookId: string;
  readonly countryCode: string;
  readonly name: string;
  readonly oneDayChangePercent: number | null;
  readonly managementFee: number | null;
  readonly productFee: number | null;
  readonly numberOfOwners: number;
  readonly riskScore: number | null;
  readonly hasPosition: boolean;
  readonly collateralValue: number | null;
}

export interface ScreenedCertificate {
  readonly orderbookId: string;
  readonly countryCode: string;
  readonly name: string;
  readonly direction: string;
  readonly marketplaceCode: string;
  readonly issuer: string;
  readonly hasPosition: boolean;
  readonly totalValueTraded: number;
  readonly underlyingInstrument: UnderlyingInstrument | null;
  readonly leverage: number | null;
  readonly spread: number | null;
  readonly buyPrice: number | null;
  readonly sellPrice: number | null;
}

export interface ScreenedWarrant {
  readonly orderbookId: string;
  readonly countryCode: string;
  readonly name: string;
  readonly direction: string;
  readonly issuer: string;
  readonly subType: string;
  readonly hasPosition: boolean;
  readonly underlyingInstrument: UnderlyingInstrument | null;
  readonly totalValueTraded: number;
  readonly spread: number | null;
  readonly oneDayChangePercent: number | null;
  readonly buyPrice: number | null;
  readonly sellPrice: number | null;
}

export type ScreenEtfsResponse = ScreenListedProductsResponse<'etfs', ScreenedEtf>;
export type ScreenCertificatesResponse = ScreenListedProductsResponse<
  'certificates',
  ScreenedCertificate
>;
export type ScreenWarrantsResponse = ScreenListedProductsResponse<'warrants', ScreenedWarrant>;
