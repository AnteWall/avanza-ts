import nock from "nock";
import { MarketClient } from "./MarketClient";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import { InstrumentType, PositionResponse } from "./types";
import fetch from "node-fetch";
import { InstrumentResponse, SearchResponse } from "./market_types";
describe("MarketClient", () => {
  describe("search", () => {
    it("should return results", async () => {
      const reply: SearchResponse = {
        configurationResponse: {},
        searchQuery: "aaple",
        urlEncodedSearchQuery: "aaple",
        numberOfHits: 1,
        totalNumberOfHits: 1,
        pageSearchResults: {
          hits: [
            {
              link: {
                type: InstrumentType.STOCK,
                flagCode: "US",
                orderbookId: "3323",
                urlDisplayName: "apple-inc",
                linkDisplay: "Apple Inc",
                shortLinkDisplay: "APPLE",
                tradeable: true,
                sellable: true,
                buyable: true,
              },
              currency: "USD",
              lastPrice: "150,27",
              todayChange: "1,53",
              todayChangeDirection: "1",
              todayChangeValue: "2,26",
              oneQuarterAgoPrice: "167,590000",
              oneQuarterAgoChange: "-10,33",
              oneQuarterAgoChangeDirection: "-1",
              highlightedDisplayTitle:
                '<mark class="bold">Apple</mark> Inc (AAPL)',
              fundResult: "-",
            },
          ],
          numberOfHits: 1,
          totalNumberOfHits: 1,
        },
      };
      const client = new AvanzaClient({ fetch });
      const accountClient = new MarketClient(client);
      nock(AVANZA_URL)
        .get("/_cqbe/search/global-search/global-search-template")
        .query({ query: "apple" })
        .once()
        .reply(200, reply);
      const positions = await accountClient.search("apple");
      expect(positions).toEqual(reply);
    });

    it("should throw error if request fails", async () => {
      const client = new AvanzaClient({ fetch });
      const accountClient = new MarketClient(client);
      nock(AVANZA_URL)
        .get("/_cqbe/search/global-search/global-search-template")
        .query({ query: "apple" })
        .once()
        .reply(500, "Internal server error");
      await expect(accountClient.search("apple")).rejects.toThrow(
        "Internal server error"
      );
    });
  });

  describe("getInstrument", () => {
    it("should return results", async () => {
      const reply: InstrumentResponse = {
        orderbookId: "3323",
        name: "Apple Inc",
        isin: "US0378331005",
        sectors: [
          { sectorId: "146", sectorName: "Hemelektronik" },
          { sectorId: "45", sectorName: "Hem & Bostad" },
          { sectorId: "24", sectorName: "Konsumentvaror & Tjänster" },
        ],
        tradable: "BUYABLE_AND_SELLABLE",
        listing: {
          shortName: "APPLE",
          tickerSymbol: "AAPL",
          countryCode: "US",
          currency: "USD",
          marketPlaceCode: "XNAS",
          marketPlaceName: "NASDAQ",
          tickSizeListId: "7700009",
          marketTradesAvailable: false,
        },
        historicalClosingPrices: {
          oneDay: 148.01,
          oneWeek: 150.07,
          oneMonth: 147.27,
          threeMonths: 167.59,
          startOfYear: 177.61,
          oneYear: 161.08,
          threeYears: 65.46,
          fiveYears: 43.74,
          tenYears: 20.06,
          start: 0.15,
          startDate: "1998-01-02",
        },
        keyIndicators: {
          numberOfOwners: 54438,
          reportDate: "2022-07-28",
          directYield: 0.0061,
          volatility: 0.4636,
          beta: 1.2227,
          priceEarningsRatio: 23.63,
          priceSalesRatio: 7.74,
          returnOnEquity: 1.6275,
          returnOnTotalAssets: 0.35,
          equityRatio: 0.1728,
          capitalTurnover: 0.9047,
          operatingProfitMargin: 0.3108,
          grossMargin: 0.4362,
          netMargin: 0.3868,
          marketCapital: { value: 2395568639810, currency: "USD" },
          equityPerShare: { value: 3.65, currency: "USD" },
          turnoverPerShare: { value: 19.13, currency: "USD" },
          earningsPerShare: { value: 6.26, currency: "USD" },
          dividend: {
            exDate: "2022-11-04",
            paymentDate: "2022-11-10",
            amount: 0.23,
            currencyCode: "USD",
            exDateStatus: "HISTORICAL",
          },
          dividendsPerYear: 4,
          previousReport: { date: "2022-10-27", reportType: "ANNUAL" },
        },
        quote: {
          buy: 150.13,
          sell: 150.2,
          last: 150.18,
          highest: 150.4,
          lowest: 146.93,
          change: 2.17,
          changePercent: 1.47,
          spread: 0.05,
          timeOfLast: 1669150804480,
          totalValueTraded: 0,
          totalVolumeTraded: 51267278,
          updated: 1669150856867,
        },
        type: "STOCK",
      };
      const client = new AvanzaClient({ fetch });
      const accountClient = new MarketClient(client);
      nock(AVANZA_URL)
        .get("/_api/market-guide/stock/3323")
        .once()
        .reply(200, reply);
      const res = await accountClient.getInstrument(
        InstrumentType.STOCK,
        "3323"
      );
      expect(res).toEqual(reply);
    });

    it("should throw error if request fails", async () => {
      const client = new AvanzaClient({ fetch });
      const accountClient = new MarketClient(client);
      nock(AVANZA_URL)
        .get("/_api/market-guide/stock/3323")
        .once()
        .reply(500, "Internal server error");
      await expect(
        accountClient.getInstrument(InstrumentType.STOCK, "3323")
      ).rejects.toThrow("Internal server error");
    });
  });
});
