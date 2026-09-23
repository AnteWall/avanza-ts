export interface OrderCount {
  readonly count: number;
}

export interface TradingOrderbook {
  readonly id: string;
  readonly name: string;
  readonly isin: string;
  readonly instrumentId: string;
  readonly instrumentType: string;
  readonly marketPlace: string;
  readonly countryCode: string;
  readonly currency: string;
  readonly tickerSymbol: string;
  readonly tickSizeList: {
    readonly tickSizeEntries: readonly {
      readonly min: number;
      readonly max: number;
      readonly tick: number;
    }[];
  };
  readonly collateralValue: number;
  readonly minValidUntil: string;
  readonly maxValidUntil: string;
  readonly volumeFactor: number;
  readonly priceType: string;
  readonly tradingUnit: number;
  readonly featureSupport: Readonly<Record<string, boolean>>;
}

export interface ExchangeRate {
  readonly orderbookId: string;
  readonly currency: string;
  readonly flagCode: string;
  readonly buyPrice: string;
  readonly sellPrice: string;
  readonly updated: string;
}

/** For example `MARKET_OPEN`. */
export type MarketStatus = string;

export interface BulkOrderOptions {
  readonly accountId?: string | undefined;
  /** For example `BUY`. */
  readonly side?: string | undefined;
}

export interface BulkOrder {
  readonly id: string;
  readonly created: string;
  readonly side: string;
  readonly accountId: string;
  readonly totalSum: string;
  readonly createdFrom: string;
  readonly tradingBulkOrderEntities: readonly {
    readonly orderBookId: string;
    readonly volume: number;
    readonly amount: string;
  }[];
}

export interface BulkOrdersResponse {
  readonly tradingBulkOrders: readonly BulkOrder[];
}

export interface StopLossOptions {
  readonly accountId?: string | undefined;
  readonly orderbookId?: string | undefined;
}

/**
 * Field names follow the web app's stop-loss model; no captured response
 * contained a stop-loss yet.
 */
export interface StopLoss {
  readonly id: string;
  readonly status: string | null;
  readonly editable: boolean;
  readonly deletable: boolean;
  readonly message?: string | null;
  readonly account: { readonly id?: string; readonly urlParameterId?: string } & Readonly<
    Record<string, unknown>
  >;
  readonly orderbook?: {
    readonly id?: string;
    readonly name?: string;
    readonly currency?: string;
  } & Readonly<Record<string, unknown>>;
  readonly order?: {
    readonly type: string;
    readonly price: number;
    /** `MONETARY` or `PERCENTAGE`. */
    readonly priceType: string;
    readonly volume: number;
    readonly validDays?: number | null;
    readonly shortSellingAllowed?: boolean;
  } | null;
  readonly trigger?: {
    readonly type: string;
    readonly value: number;
    /** `MONETARY` or `PERCENTAGE`. */
    readonly valueType: string;
    readonly validDays?: number | null;
    readonly validUntil?: string | null;
    readonly extremePrice?: number | null;
    readonly triggerOnMarketMakerQuote?: boolean;
  } | null;
}
