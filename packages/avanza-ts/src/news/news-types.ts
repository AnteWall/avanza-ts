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
