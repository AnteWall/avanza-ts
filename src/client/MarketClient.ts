import { AvanzaClient } from "./AvanzaClient";
import { SearchResponse } from "./market_types";
import { InstrumentType } from "./types";

const MARKET_PATHS = {
  SEARCH: "/_cqbe/search/global-search/global-search-template",
};

export class MarketClient {
  private readonly client: AvanzaClient;
  constructor(client: AvanzaClient) {
    this.client = client;
  }

  async search(query: string): Promise<SearchResponse> {
    const response = await this.client.get(MARKET_PATHS.SEARCH, {
      params: { query },
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(JSON.stringify(errorMessage));
    }
    const data = (await response.json()) as SearchResponse;
    return data;
  }
}
