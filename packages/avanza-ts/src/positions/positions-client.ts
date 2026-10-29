import type { ClientContext } from '../internal/client-context.js';
import type { HttpRequest } from '../internal/http-types.js';
import { pathId } from '../internal/path-id.js';
import { accountIdsOrAll } from '../performance/performance-client.js';
import { positionListResponseSchema, type PositionListResponse } from './position-schemas.js';
import type {
  ActivePositionToolsResponse,
  FundAnalysisResponse,
  PositionCategoriesResponse,
  PositionCountriesResponse,
  PositionOrderbooksResponse,
  PositionPopularCategoriesResponse,
  StockPositionKeyRatiosResponse,
} from './position-types.js';

export class PositionsClient {
  public constructor(protected readonly context: ClientContext) {}

  public async list(accountId?: string, signal?: AbortSignal): Promise<PositionListResponse> {
    return positionListResponseSchema.parse(
      await this.get(`/_api/position-data/positions${pathId(accountId)}`, signal),
    );
  }

  public countries(accountId?: string, signal?: AbortSignal): Promise<PositionCountriesResponse> {
    return this.get(`/_api/position-data/country/list${pathId(accountId)}`, signal);
  }

  public activeTools(signal?: AbortSignal): Promise<ActivePositionToolsResponse> {
    return this.get('/_api/position-data/tools/active', signal);
  }

  public orderbooks(
    orderbookIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<PositionOrderbooksResponse> {
    if (orderbookIds.length === 0 || orderbookIds.some((id) => !id.trim())) {
      throw new TypeError('At least one nonempty orderbook ID is required.');
    }
    return this.get('/_api/position-data/orderbooks', signal, { orderbookIds });
  }

  public categories(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<PositionCategoriesResponse> {
    return this.get(
      `/_api/position-statistics/statistics/categories${pathId(orderbookId)}`,
      signal,
    );
  }

  public popularCategories(
    orderbookId: string,
    signal?: AbortSignal,
  ): Promise<PositionPopularCategoriesResponse> {
    return this.get(
      `/_api/position-statistics/statistics/popular-categories${pathId(orderbookId)}`,
      signal,
    );
  }

  /** Dividend and valuation ratios per stock position. */
  public stockKeyRatios(
    accountId?: string,
    signal?: AbortSignal,
  ): Promise<StockPositionKeyRatiosResponse> {
    return this.get(`/_api/position-data/STOCK/keyratios${pathId(accountId)}`, signal);
  }

  /** Look-through of fund holdings: exposures, fees, risk, and ESG. Omitted `ids` include all accounts. */
  public async fundAnalysis(
    ids?: readonly string[],
    signal?: AbortSignal,
  ): Promise<FundAnalysisResponse> {
    return this.context.http.request<FundAnalysisResponse>({
      access: 'required',
      method: 'POST',
      path: '/_api/portfolio-analysis/analyze',
      body: await accountIdsOrAll(this.context, ids, signal),
      signal,
    });
  }

  private get<Response>(
    path: string,
    signal?: AbortSignal,
    query: NonNullable<HttpRequest['query']> = {},
  ): Promise<Response> {
    return this.context.http.request<Response>({
      access: 'required',
      method: 'GET',
      path,
      query,
      signal,
    });
  }
}
