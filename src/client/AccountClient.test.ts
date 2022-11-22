import nock from "nock";
import { AccountClient } from "./AccountClient";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import { AccountOverview, InstrumentType, PositionResponse } from "./types";

describe("AccountClient", () => {
  describe("getPositions", () => {
    it("should return positions", async () => {
      const reply: PositionResponse = {
        instrumentPositions: [
          {
            instrumentType: InstrumentType.STOCK,
            positions: [],
            todaysProfitPercent: 0,
            totalProfitPercent: 0,
            totalProfitValue: 0,
            totalValue: 0,
          },
        ],
        totalBalance: 0,
        totalBuyingPower: 0,
        totalOwnCapital: 0,
        totalProfit: 0,
        totalProfitPercent: 0,
      };
      const client = new AvanzaClient();
      const accountClient = new AccountClient(client);
      nock(AVANZA_URL)
        .get("/_mobile/account/positions")
        .once()
        .reply(200, reply);
      const positions = await accountClient.getPositions();
      expect(positions).toEqual(reply);
    });

    it("should throw error if request fails", async () => {
      const client = new AvanzaClient();
      const accountClient = new AccountClient(client);
      nock(AVANZA_URL)
        .get("/_mobile/account/positions")
        .once()
        .reply(500, "Internal server error");
      await expect(accountClient.getPositions()).rejects.toThrow(
        "Internal server error"
      );
    });
  });

  describe("getAccountOverview", () => {
    it("returns account overview", async () => {
      const client = new AccountClient(new AvanzaClient());
      nock(AVANZA_URL)
        .get("/_mobile/account/overview")
        .query({ accountId: "accountId-123" })
        .once()
        .reply(200, {
          accountId: "accountId-123",
        } as AccountOverview);
      const accountOverview = await client.getAccountOverview("accountId-123");
      expect(accountOverview).toEqual({
        accountId: "accountId-123",
      } as AccountOverview);
    });
    it("returns error", async () => {
      const client = new AccountClient(new AvanzaClient());
      nock(AVANZA_URL)
        .get("/_mobile/account/overview")
        .query({ accountId: "accountId-123" })
        .once()
        .reply(404, {
          error: "error-123",
        });
      await expect(client.getAccountOverview("accountId-123")).rejects.toThrow(
        '"{\\"error\\":\\"error-123\\"}"'
      );
    });
  });
});
