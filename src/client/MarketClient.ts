import { AvanzaClient } from "./AvanzaClient";
import { InstrumentResponse, SearchResponse } from "./market_types";
import { InstrumentType } from "./types";

const MARKET_PATHS = {
  SEARCH: "/_cqbe/search/global-search/global-search-template",
  GET_INSTRUMENT: "/_api/market-guide/{instrument}/{id}",
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

  async getInstrument(
    instrumentType: InstrumentType,
    instrumentId: string
  ): Promise<InstrumentResponse> {
    const response = await this.client.get(
      MARKET_PATHS.GET_INSTRUMENT.replace(
        "{instrument}",
        instrumentType.toLowerCase()
      ).replace("{id}", instrumentId),
      {}
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(JSON.stringify(errorMessage));
    }
    const data = (await response.json()) as InstrumentResponse;
    return data;
  }
}
