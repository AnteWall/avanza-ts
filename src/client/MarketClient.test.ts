import nock from "nock";
import { MarketClient } from "./MarketClient";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import { InstrumentType, PositionResponse } from "./types";
import fetch from "node-fetch";
import {
  InstrumentDetailsResponse,
  InstrumentResponse,
  SearchResponse,
} from "./market_types";
describe("MarketClient", () => {
  describe("search", () => {
    it("should return results", async () => {
      const reply: SearchResponse = {
        configurationResponse: {},
        searchQuery: "aaple",
        urlEncodedSearchQuery: "aaple",
        numberOfHits: 1,
        totalNumberOfHits: 1,
        resultGroups: [],
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

  describe("getInstrumentDetails", () => {
    it("should return results", async () => {
      const reply: InstrumentDetailsResponse = {
        stock: {
          preferred: false,
          depositaryReceipt: false,
          numberOfShares: 15908118000,
        },
        company: {
          companyId: "100004",
          description:
            "Apple är ett amerikanskt data- och hemelektronikbolag. Bolaget designar mobiler, datorer och surfplattor. Exempel på varumärken inkluderar Macbook, Iphone, Apple TV, och Ipad. Utöver erbjuds egenutvecklade programvaror, kringutrustning, nätverkslösningar, samt tillhörande kundsupport. Produkterna säljs på global nivå, både via egna butiker, distributionskanaler, samt auktoriserade återförsäljare. Bolaget grundades ursprungligen 1976 i Cupertino, Kalifornien. ",
          ceo: "Tim Cook",
          chairman: "Arthur Levinson",
          totalNumberOfShares: 15908118000,
          homepage:
            "https://investor.apple.com/investor-relations/default.aspx",
        },
        companyEvents: {
          events: [
            { date: "2022-04-28", type: "INTERIM_REPORT" },
            { date: "2022-10-27", type: "ANNUAL_REPORT" },
            { date: "2022-03-04", type: "GENERAL_MEETING" },
            { date: "2022-07-28", type: "INTERIM_REPORT" },
            { date: "2022-01-27", type: "INTERIM_REPORT" },
          ],
        },
        companyOwners: { owners: [] },
        brokerTradeSummaries: [
          {
            brokerCode: "ANON",
            sellVolume: 37636327,
            buyVolume: 37636327,
            netBuyVolume: 0,
            brokerName: "ANON",
          },
        ],
        dividends: {
          events: [],
          pastEvents: [
            {
              exDate: "2022-11-04",
              paymentDate: "2022-11-10",
              amount: 0.23,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2022-08-05",
              paymentDate: "2022-08-11",
              amount: 0.23,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2022-05-06",
              paymentDate: "2022-05-12",
              amount: 0.23,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2022-02-04",
              paymentDate: "2022-02-10",
              amount: 0.22,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2021-11-05",
              paymentDate: "2021-11-11",
              amount: 0.22,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2021-08-06",
              paymentDate: "2021-08-12",
              amount: 0.22,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2021-05-07",
              paymentDate: "2021-05-13",
              amount: 0.22,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2021-02-05",
              paymentDate: "2021-02-11",
              amount: 0.205,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2020-11-06",
              paymentDate: "2020-11-12",
              amount: 0.205,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2020-08-07",
              paymentDate: "2020-08-13",
              amount: 0.205,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2020-05-08",
              paymentDate: "2020-05-14",
              amount: 0.205,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2020-02-07",
              paymentDate: "2020-02-13",
              amount: 0.1925,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2019-11-07",
              paymentDate: "2019-11-14",
              amount: 0.1925,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2019-08-09",
              paymentDate: "2019-08-15",
              amount: 0.1925,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
            {
              exDate: "2019-05-10",
              paymentDate: "2019-05-16",
              amount: 0.1925,
              currencyCode: "USD",
              dividendType: "ORDINARY",
            },
          ],
        },
        tradingTerms: {
          collateralValue: 0.6,
          marginRequirement: 1.5,
          shortSellable: false,
          superInterestApproved: true,
        },
        fundExposures: [
          {
            orderbookId: "181108",
            name: "Länsförsäkringar USA Index",
            exposure: 0.1036,
            countryCode: "SE",
            hasPosition: false,
          },
          {
            orderbookId: "1482",
            name: "Länsförsäkringar USA Aktiv A",
            exposure: 0.0932,
            countryCode: "SE",
            hasPosition: false,
          },
          {
            orderbookId: "4766",
            name: "UBS (Lux) ES USA Growth $ P-acc",
            exposure: 0.093,
            countryCode: "LU",
            hasPosition: false,
          },
          {
            orderbookId: "415688",
            name: "BNP Paribas US Growth Classic C",
            exposure: 0.0899,
            countryCode: "LU",
            hasPosition: false,
          },
          {
            orderbookId: "431",
            name: "BGF World Technology A2",
            exposure: 0.0874,
            countryCode: "LU",
            hasPosition: false,
          },
          {
            orderbookId: "1358060",
            name: "Investerum Equity Value",
            exposure: 0.0855,
            countryCode: "SE",
            hasPosition: false,
          },
          {
            orderbookId: "1474",
            name: "SEB USA Indexnära D USD - Lux utd",
            exposure: 0.0837,
            countryCode: "LU",
            hasPosition: false,
          },
          {
            orderbookId: "410277",
            name: "Allianz US Equity Fund AT USD",
            exposure: 0.0831,
            countryCode: "LU",
            hasPosition: false,
          },
          {
            orderbookId: "315115",
            name: "Handelsbanken USA Ind Crit A1 SEK",
            exposure: 0.083,
            countryCode: "SE",
            hasPosition: false,
          },
          {
            orderbookId: "1506",
            name: "Öhman Marknad USA A",
            exposure: 0.0827,
            countryCode: "SE",
            hasPosition: false,
          },
        ],
        trades: [
          {
            buyer: "",
            seller: "",
            dealTime: 1669661720077,
            price: 144.34,
            volume: 47064,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661700162,
            price: 144.39,
            volume: 38981,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661679983,
            price: 144.33,
            volume: 40437,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661660176,
            price: 144.28,
            volume: 117083,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661640239,
            price: 144.34,
            volume: 82640,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661620264,
            price: 144.31,
            volume: 55923,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661600087,
            price: 144.34,
            volume: 58970,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661580259,
            price: 144.42,
            volume: 72298,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661560270,
            price: 144.38,
            volume: 168601,
            matchedOnMarket: true,
            cancelled: false,
          },
          {
            buyer: "",
            seller: "",
            dealTime: 1669661540209,
            price: 144.52,
            volume: 38868,
            matchedOnMarket: true,
            cancelled: false,
          },
        ],
        orderDepthLevels: [
          {
            buySide: { price: 144.33, priceString: "144.33", volume: 372 },
            sellSide: { price: 144.34, priceString: "144.34", volume: 100 },
          },
        ],
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
