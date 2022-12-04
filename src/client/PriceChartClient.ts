import { AvanzaClient } from "./AvanzaClient";
import {
  PriceChartResolution,
  PriceChartResponse,
  PriceChartTimePeriod,
} from "./price_chart_types";
import { InstrumentType } from "./types";

const PRICE_CHARTS_PATHS = {
  PRICE_CHART: "/_api/price-chart/{instrument}/{id}?timePeriod={timePeriod}",
};

export class PriceChartClient {
  private readonly client: AvanzaClient;

  constructor(client: AvanzaClient) {
    this.client = client;
  }

  async getPriceChart(
    instrumentType: InstrumentType,
    instrumentId: string,
    timePeriod = PriceChartTimePeriod.ONE_MONTH,
    resolution?: PriceChartResolution
  ): Promise<PriceChartResponse> {
    let path = PRICE_CHARTS_PATHS.PRICE_CHART.replace(
      "{instrument}",
      instrumentType.toLowerCase()
    )
      .replace("{id}", instrumentId)
      .replace("{timePeriod}", timePeriod);
    if (resolution) {
      path += `&resolution=${resolution}`;
    }
    const response = await this.client.get(path, {});
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const data = (await response.json()) as PriceChartResponse;
    return data;
  }
}
