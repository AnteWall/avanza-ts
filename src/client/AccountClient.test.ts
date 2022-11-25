import nock from "nock";
import { AccountClient } from "./AccountClient";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import {
  AccountsOverviewResponse,
  InstrumentType,
  PositionResponse,
} from "./types";
import fetch from "node-fetch";

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
      const client = new AvanzaClient({ fetch });
      const accountClient = new AccountClient(client);
      nock(AVANZA_URL)
        .get("/_mobile/account/positions")
        .once()
        .reply(200, reply);
      const positions = await accountClient.getPositions();
      expect(positions).toEqual(reply);
    });

    it("should throw error if request fails", async () => {
      const client = new AvanzaClient({ fetch });
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

  describe("getOverview", () => {
    it("returns account overview", async () => {
      const client = new AccountClient(new AvanzaClient({ fetch }));
      nock(AVANZA_URL)
        .get("/_mobile/account/overview")
        .once()
        .reply(200, {
          numberOfDeals: 2,
        } as AccountsOverviewResponse);
      const accountOverview = await client.getOverview();
      expect(accountOverview).toEqual({
        numberOfDeals: 2,
      } as AccountsOverviewResponse);
    });
    it("returns error", async () => {
      const client = new AccountClient(new AvanzaClient({ fetch }));
      nock(AVANZA_URL).get("/_mobile/account/overview").twice().reply(404, {
        error: "error-123",
      });
      await expect(client.getOverview()).rejects.toThrow(
        '{"error":"error-123"}'
      );
      try {
        await client.getOverview();
      } catch (e) {
        expect(JSON.parse(e.message)).toEqual({
          error: "error-123",
        });
      }
    });
  });
});
