import nock from "nock";
import { MarketClient } from "./MarketClient";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import { InstrumentType, PositionResponse } from "./types";
import fetch from "node-fetch";
import { SearchResponse } from "./market_types";
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
});
