export interface PushSubscribeOptions {
  /** Ends the subscription and closes the connection. */
  readonly signal?: AbortSignal;
}

export interface PushTradingOptions extends PushSubscribeOptions {
  readonly orderbookId?: string;
}

export interface PushQuote {
  readonly orderbookId: string;
  readonly buyPrice?: number | null;
  readonly sellPrice?: number | null;
  readonly lastPrice?: number | null;
  readonly highestPrice?: number | null;
  readonly lowestPrice?: number | null;
  readonly spreadPercent?: number | null;
  readonly change?: number | null;
  readonly changePercent?: number | null;
  readonly lastPriceUpdated?: number | null;
  readonly totalValueTraded?: number | null;
  readonly totalVolumeTraded?: number | null;
  readonly updated?: number | null;
  readonly volumeWeightedAveragePrice?: number | null;
  readonly [key: string]: unknown;
}

export interface PushOrderDepthLevel {
  readonly buyPrice?: number | null;
  readonly buyVolume?: number | null;
  readonly sellPrice?: number | null;
  readonly sellVolume?: number | null;
  readonly [key: string]: unknown;
}

export interface PushOrderDepth {
  readonly orderbookId: string;
  readonly marketMakerLevelInAsk?: number | null;
  readonly marketMakerLevelInBid?: number | null;
  readonly levels: readonly PushOrderDepthLevel[];
  readonly [key: string]: unknown;
}

export interface PushTrade {
  readonly dealTime?: number;
  readonly price?: number;
  readonly volume?: number;
  readonly [key: string]: unknown;
}

/** Payload shape not yet captured from a live stream. */
export type PushEvent = Readonly<Record<string, unknown>>;
