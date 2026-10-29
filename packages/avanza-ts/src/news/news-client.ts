import type { ClientContext } from '../internal/client-context.js';
import type {
  CalendarResponse,
  NewsArticle,
  NewsFeedOptions,
  NewsFeedResponse,
  NewsScreenOptions,
  NewsScreenResponse,
  NewsScreenerFilters,
} from './news-types.js';

export class NewsClient {
  public constructor(protected readonly context: ClientContext) {}

  /** `url` is an article URL or path from the news feed, for example `/telegram/avanza/<id>`. */
  public article(url: string, signal?: AbortSignal): Promise<NewsArticle> {
    const path = URL.canParse(url) ? new URL(url).pathname : url;
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) throw new TypeError('Article URL must not be empty.');
    return this.context.http.request<NewsArticle>({
      access: 'optional',
      method: 'GET',
      path: `/_api/news/article/${segments.map(encodeURIComponent).join('/')}`,
      signal,
    });
  }

  /** Filters for {@link screen}; account and watchlist filters need a session. */
  public screenerFilters(signal?: AbortSignal): Promise<NewsScreenerFilters> {
    return this.context.http.request<NewsScreenerFilters>({
      access: 'optional',
      method: 'GET',
      path: '/_api/news-screener/filters',
      signal,
    });
  }

  /** Market news matching every given filter, newest first. */
  public screen(
    options: NewsScreenOptions = {},
    signal?: AbortSignal,
  ): Promise<NewsScreenResponse> {
    const filters = {
      companies: options.companies,
      accounts: options.accounts,
      watchLists: options.watchlists,
      newsTypes: options.newsTypes,
      sectors: options.sectors,
      marketplaces: options.marketplaces,
      sources: options.sources,
    };
    return this.context.http.request<NewsScreenResponse>({
      access: 'optional',
      method: 'GET',
      path: '/_api/news-screener/results',
      // The frontend sends comma-joined IDs, not repeated parameters.
      query: Object.fromEntries(
        Object.entries(filters)
          .filter(([, ids]) => ids?.length)
          .map(([name, ids]) => [name, ids!.join(',')]),
      ),
      signal,
    });
  }

  /** Requires a session. News for held and watched instruments. */
  public feed(options: NewsFeedOptions = {}, signal?: AbortSignal): Promise<NewsFeedResponse> {
    return this.context.http.request<NewsFeedResponse>({
      access: 'required',
      method: 'GET',
      path: '/_api/customer-news-feed-v2/news',
      query: { count: options.count ?? 10, maxDays: options.maxDays ?? 30 },
      signal,
    });
  }

  /** Requires a session. Item fields are unverified; captured lists were empty so far. */
  public offers(signal?: AbortSignal): Promise<readonly Readonly<Record<string, unknown>>[]> {
    return this.context.http.request<readonly Readonly<Record<string, unknown>>[]>({
      access: 'required',
      method: 'GET',
      path: '/_api/customer-offer/currentoffers/',
      signal,
    });
  }

  /** Requires a session. Upcoming dividends, reports, and other events by month. */
  public calendar(signal?: AbortSignal): Promise<CalendarResponse> {
    return this.context.http.request<CalendarResponse>({
      access: 'required',
      method: 'GET',
      path: '/_api/customer-calendar/calendar',
      signal,
    });
  }
}
