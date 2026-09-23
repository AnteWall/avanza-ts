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
