export interface NewsArticleOrderbook {
  readonly id: string;
  readonly name: string;
  readonly currency: string;
  readonly instrumentType: string;
  readonly flagCode: string;
  readonly change: number;
  readonly changePercent: number;
  readonly lastPrice: number;
  readonly highestPrice: number;
  readonly lowestPrice: number;
  readonly totalVolumeTraded: number;
  readonly updated: string;
  readonly tradable: boolean;
  readonly buyable: boolean;
  readonly sellable: boolean;
}

export interface NewsArticle {
  readonly url: string;
  /** For example `Nyhet` or `Telegram`. */
  readonly type: string;
  readonly title: string;
  readonly vignette: string;
  readonly source: string;
  readonly publishDate: string;
  /** HTML. */
  readonly body: string;
  readonly orderbooks: readonly NewsArticleOrderbook[];
}

export interface NewsFeedOptions {
  readonly count?: number | undefined;
  readonly maxDays?: number | undefined;
}

export interface NewsFeedOrderbook {
  readonly id: string;
  readonly name: string;
  readonly instrumentType: string;
  readonly flagCode: string;
  readonly dailyPerformance: number;
}

export interface NewsFeedItem {
  readonly id: string;
  readonly title: string;
  readonly vignette: string;
  readonly text: string;
  readonly subject: string;
  readonly source: string;
  /** Pass to `NewsClient.article()` for the full article. */
  readonly url: string;
  readonly externalLink: boolean;
  readonly tag: string;
  readonly category: string | null;
  readonly mainCategory: string;
  readonly publishDateTime: string;
  readonly orderbooks: readonly NewsFeedOrderbook[];
}

export interface NewsFeedResponse {
  readonly news: readonly NewsFeedItem[];
  readonly currentDateTime: string;
}

export interface CalendarOrderbook {
  readonly id: string;
  readonly name: string;
  readonly instrumentType: string;
  readonly flagCode: string;
}

export interface CalendarDividend {
  readonly orderbook: CalendarOrderbook;
  readonly price: number;
  readonly volume: number;
  readonly amount: number;
  readonly currency: string;
  readonly exclusiveDividendDate: string;
  readonly paymentDate: string;
  readonly established: boolean;
}

export interface CalendarReport {
  readonly orderbook: CalendarOrderbook;
  readonly date: string;
  readonly reportType: string;
  readonly companyName: string;
}

/** Event lists typed as `unknown[]` were absent from every capture so far. */
export interface CalendarMonth {
  /** `yyyy-MM`. */
  readonly yearMonth: string;
  readonly upcomingDividends?: {
    readonly upcomingDividends: readonly CalendarDividend[];
    readonly totalAmountSek: number;
  };
  readonly reports?: readonly CalendarReport[];
  readonly offers?: readonly unknown[];
  readonly notes?: readonly unknown[];
  readonly monthlySavings?: readonly unknown[];
  readonly recurringDeposits?: readonly unknown[];
  readonly recurringFundInvestments?: readonly unknown[];
  readonly generalMeetings?: readonly unknown[];
}

export type CalendarResponse = readonly CalendarMonth[];

/** A news screener filter; `id` is what {@link NewsScreenOptions} takes. */
export interface NewsScreenerFilter {
  readonly id: string;
  readonly label: string;
  readonly value: boolean;
  readonly accordionState: string;
  readonly children: readonly NewsScreenerFilter[];
  readonly metaData: readonly unknown[];
}

/** `watchLists` and `accounts` are empty without a session. */
export interface NewsScreenerFilters {
  readonly sectors: readonly NewsScreenerFilter[];
  readonly marketplaces: readonly NewsScreenerFilter[];
  readonly newsTypes: readonly NewsScreenerFilter[];
  readonly sources: readonly NewsScreenerFilter[];
  readonly watchLists: readonly NewsScreenerFilter[];
  readonly accounts: readonly NewsScreenerFilter[];
}

/** Filter IDs from {@link NewsScreenerFilters}; `companies` takes orderbook IDs. */
export interface NewsScreenOptions {
  readonly companies?: readonly string[] | undefined;
  /** Requires a session. */
  readonly accounts?: readonly string[] | undefined;
  /** Requires a session. */
  readonly watchlists?: readonly string[] | undefined;
  readonly newsTypes?: readonly string[] | undefined;
  readonly sectors?: readonly string[] | undefined;
  readonly marketplaces?: readonly string[] | undefined;
  readonly sources?: readonly string[] | undefined;
}

export interface NewsScreenArticle {
  readonly headline: string;
  readonly vignette: string | null;
  readonly teaser: string;
  readonly ingress: string | null;
  readonly source: string;
  /** For example `NEWS`, `TELEGRAM`, `PRESS_RELEASE`, `ANALYSIS`, or `OTHER`. */
  readonly category: string;
  readonly publishTime: number;
  /** Article path for `news.article()`. */
  readonly path: string;
  readonly orderbookIds: readonly string[];
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly instrumentType: string | null;
  readonly flagCode: string | null;
}

export interface NewsScreenResponse {
  readonly articles: readonly NewsScreenArticle[];
}
