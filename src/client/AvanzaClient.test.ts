import { Fetcher } from "@apollo/utils.fetcher";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";

describe("AvanzaClient", () => {
  it("can set baseUrl with options", () => {
    const url = "https://www.myurl.se";
    const client = new AvanzaClient({ baseUrl: url });
    expect(client.baseUrl).toEqual(url);
  });
  it("default baseUrl to AVANZA_URL", () => {
    const client = new AvanzaClient();
    expect(client.baseUrl).toEqual(AVANZA_URL);
  });

  it("default fetch to node-fetch", () => {
    const client = new AvanzaClient();
    expect(client.fetch).toEqual(require("node-fetch"));
  });

  it("can set fetch to other clients", () => {
    const myFetchLib = () => {};
    const client = new AvanzaClient({
      fetch: myFetchLib as unknown as Fetcher,
    });
    expect(client.fetch).toEqual(myFetchLib);
  });

  describe("getDefaultHeaders", () => {
    it("returns default headers", () => {
      const client = new AvanzaClient();
      expect(client.getDefaultHeaders()).toEqual({
        "Content-Type": "application/json",
      });
    });
    it("returns default headers with session", () => {
      const client = new AvanzaClient();
      client.setSession({
        authenticationSession: "authenticationSession-123",
        customerId: "123",
        pushSubscriptionId: "123",
        registrationComplete: true,
        securityToken: "securityToken-123",
      });
      expect(client.getDefaultHeaders()).toEqual({
        "Content-Type": "application/json",
        "X-SecurityToken": "securityToken-123",
        "X-AuthenticationSession": "authenticationSession-123",
      });
    });
  });

  describe("disconnect", () => {
    it("clears session", () => {
      const client = new AvanzaClient();
      client.setSession({
        authenticationSession: "authenticationSession-123",
        customerId: "123",
        pushSubscriptionId: "123",
        registrationComplete: true,
        securityToken: "securityToken-123",
      });
      client.disconnect();
      // @ts-expect-error
      expect(client.session).toBeUndefined();
    });
  });
});
