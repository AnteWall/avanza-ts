import nock from "nock";
import { AccountClient } from "./AccountClient";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import {
  AccountsOverviewResponse,
  InstrumentType,
  PositionResponse,
} from "./types";
import fetch from "node-fetch";
import priceChartResponse from "../../test/mocks/price-chart/apple-one-month-price-chart.json";
import {
  PriceChartResolution,
  PriceChartResponse,
  PriceChartTimePeriod,
} from "./price_chart_types";
import { PriceChartClient } from "./PriceChartClient";

describe("PriceChartClient", () => {
  describe("getPriceChart", () => {
    it("should return positions", async () => {
      const reply: PriceChartResponse = priceChartResponse;
      const client = new AvanzaClient({ fetch });
      const pcClient = new PriceChartClient(client);
      nock(AVANZA_URL)
        .get("/_api/price-chart/stock/3323?timePeriod=one_month")
        .once()
        .reply(200, reply);
      const positions = await pcClient.getPriceChart(
        InstrumentType.STOCK,
        "3323"
      );
      expect(positions).toEqual(reply);
    });

    it("modfies the path if resolution is provided", async () => {
      const reply: PriceChartResponse = priceChartResponse;
      const client = new AvanzaClient({ fetch });
      const pcClient = new PriceChartClient(client);
      nock(AVANZA_URL)
        .get("/_api/price-chart/stock/3323?timePeriod=one_month&resolution=day")
        .once()
        .reply(200, reply);
      const positions = await pcClient.getPriceChart(
        InstrumentType.STOCK,
        "3323",
        PriceChartTimePeriod.ONE_MONTH,
        PriceChartResolution.DAY
      );
      expect(positions).toEqual(reply);
    });

    it("should throw error if request fails", async () => {
      const client = new AvanzaClient({ fetch });
      const pcClient = new PriceChartClient(client);
      nock(AVANZA_URL)
        .get("/_api/price-chart/stock/3323?timePeriod=one_month")
        .once()
        .reply(500, "Internal server error");
      await expect(
        pcClient.getPriceChart(InstrumentType.STOCK, "3323")
      ).rejects.toThrow("Internal server error");
    });
  });
});
