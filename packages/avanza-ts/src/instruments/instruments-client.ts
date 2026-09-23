import { z } from 'zod';

import type { ClientContext } from '../internal/client-context.js';
import {
  gainersLosersResponseSchema,
  savedFiltersSchema,
  screenerMetadataSchema,
  screenStocksResponseSchema,
  screenerTabsSchema,
  popularStockSectorsSchema,
  stockFilterOptionsSchema,
  stockFilterSchema,
  stockSectorGroupsSchema,
  stockSortSchema,
  themeStocksResponseSchema,
} from './stock-screener-schemas.js';
import type {
  GainersLosersResponse,
  PopularStockSector,
  SavedStockFilter,
  SavedStockFiltersResponse,
  ScreenStocksOptions,
  ScreenStocksResponse,
  StockFilter,
  StockFilterOptions,
  StockScreenerMetadataResponse,
  StockScreenerTab,
  StockScreenerTabsResponse,
  StockSectorGroup,
  StockSort,
  ThemeStocksResponse,
} from './stock-screener-types.js';

const STOCKS_PATH = '/_api/market-stock-filter/stocks';
const SETTINGS_PATH = '/_api/market-stock-filter/settings';
const SECTORS_PATH = '/_api/market-stock-filter/sectors';

export class InstrumentsClient {
  public constructor(protected readonly context: ClientContext) {}

  public async screenStocks(options: ScreenStocksOptions = {}): Promise<ScreenStocksResponse> {
    const filter = stockFilterSchema.parse({ sectors: [], marketPlaces: [], ...options.filter });
    const offset = z
      .number()
      .int()
      .nonnegative()
      .parse(options.offset ?? 0);
    const limit = z
      .number()
      .int()
      .positive()
      .parse(options.limit ?? 20);
    const sortBy = stockSortSchema.parse(
      options.sortBy ?? { field: 'numberOfOwners', order: 'desc' },
    );
    const response = await this.context.http.request<unknown>({
      access: 'optional',
      method: 'POST',
      path: STOCKS_PATH,
      body: { filter, offset, limit, sortBy },
      signal: options.signal,
    });
    return screenStocksResponseSchema.parse(response);
  }

  public async getThemeStocks(
    orderbookIds: readonly string[],
    sortBy: StockSort,
    signal?: AbortSignal,
  ): Promise<ThemeStocksResponse> {
    const body = {
      orderbookIds: z.array(z.string().min(1)).min(1).parse(orderbookIds),
      sortBy: stockSortSchema.parse(sortBy),
    };
    const response = await this.context.http.request<unknown>({
      access: 'optional',
      method: 'POST',
      path: `${STOCKS_PATH}/theme-stocks`,
      body,
      signal,
    });
    return themeStocksResponseSchema.parse(response);
  }

  public async getGainersLosers(
    filter: StockFilter = {},
    signal?: AbortSignal,
  ): Promise<GainersLosersResponse> {
    const body = { filter: stockFilterSchema.parse({ sectors: [], marketPlaces: [], ...filter }) };
    const response = await this.context.http.request<unknown>({
      access: 'optional',
      method: 'POST',
      path: `${STOCKS_PATH}/gainers-losers`,
      body,
      signal,
    });
    return gainersLosersResponseSchema.parse(response);
  }

  public async getStockFilterOptions(signal?: AbortSignal): Promise<StockFilterOptions> {
    const response = await this.context.http.request<unknown>({
      access: 'optional',
      method: 'GET',
      path: `${STOCKS_PATH}/filter-options`,
      signal,
    });
    return stockFilterOptionsSchema.parse(response);
  }

  public async getStockScreenerMetadata(
    signal?: AbortSignal,
  ): Promise<StockScreenerMetadataResponse> {
    const response = await this.context.http.request<unknown>({
      access: 'required',
      method: 'GET',
      path: `${STOCKS_PATH}/metadata`,
      signal,
    });
    return screenerMetadataSchema.parse(response);
  }

  public async getStockScreenerTabs(signal?: AbortSignal): Promise<StockScreenerTabsResponse> {
    const response = await this.context.http.request<unknown>({
      access: 'required',
      method: 'GET',
      path: `${SETTINGS_PATH}/tabs`,
      signal,
    });
    return screenerTabsSchema.parse(response);
  }

  public saveStockScreenerTabs(
    tabs: readonly StockScreenerTab[],
    signal?: AbortSignal,
  ): Promise<unknown> {
    const body = screenerTabsSchema.parse({ tabs });
    return this.context.http.request<unknown>({
      access: 'required',
      method: 'POST',
      path: `${SETTINGS_PATH}/save-tabs`,
      body,
      signal,
    });
  }

  public deleteStockScreenerTabs(signal?: AbortSignal): Promise<unknown> {
    return this.context.http.request<unknown>({
      access: 'required',
      method: 'DELETE',
      path: `${SETTINGS_PATH}/delete-tabs`,
      signal,
    });
  }

  public async getSavedStockFilters(signal?: AbortSignal): Promise<SavedStockFiltersResponse> {
    const response = await this.context.http.request<unknown>({
      access: 'required',
      method: 'GET',
      path: `${SETTINGS_PATH}/filters`,
      signal,
    });
    return savedFiltersSchema.parse(response);
  }

  public saveStockFilters(
    filters: readonly SavedStockFilter[],
    signal?: AbortSignal,
  ): Promise<unknown> {
    const body = savedFiltersSchema.parse({ filters });
    return this.context.http.request<unknown>({
      access: 'required',
      method: 'POST',
      path: `${SETTINGS_PATH}/save-filters`,
      body,
      signal,
    });
  }

  public async getPopularStockSectors(
    signal?: AbortSignal,
  ): Promise<readonly PopularStockSector[]> {
    const response = await this.context.http.request<unknown>({
      access: 'optional',
      method: 'GET',
      path: `${SECTORS_PATH}/popular`,
      signal,
    });
    return popularStockSectorsSchema.parse(response);
  }

  public async getAllStockSectors(signal?: AbortSignal): Promise<readonly StockSectorGroup[]> {
    const response = await this.context.http.request<unknown>({
      access: 'optional',
      method: 'GET',
      path: `${SECTORS_PATH}/all`,
      signal,
    });
    return stockSectorGroupsSchema.parse(response);
  }
}
