import { AvanzaClient } from "./AvanzaClient";
import { AccountsOverviewResponse, PositionResponse } from "./types";

const ACCOUNT_PATH = {
  OVERVIEW: "/_mobile/account/overview",
  POSITIONS: "/_mobile/account/positions",
};

export class AccountClient {
  private readonly client: AvanzaClient;

  constructor(client: AvanzaClient) {
    this.client = client;
  }

  async getOverview(): Promise<AccountsOverviewResponse[]> {
    const response = await this.client.get(ACCOUNT_PATH.OVERVIEW, {});
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(JSON.stringify(errorMessage));
    }
    const data = (await response.json()) as AccountsOverviewResponse[];
    return data;
  }

  async getPositions(): Promise<PositionResponse> {
    const response = await this.client.get(ACCOUNT_PATH.POSITIONS, {});
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(JSON.stringify(errorMessage));
    }
    const data = (await response.json()) as PositionResponse;
    return data;
  }
}
