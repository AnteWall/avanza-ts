import { Fetcher } from "@apollo/utils.fetcher";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import fetch from "node-fetch";

describe("AvanzaClient", () => {
  describe("isConnected", () => {
    it("should return true if session is set", () => {
      const client = new AvanzaClient({
        fetch,
      });

      client.setSession({
        authenticationSession: "authenticationSession-123",
        customerId: "123",
        pushSubscriptionId: "123",
        registrationComplete: true,
        securityToken: "security",
      });
      expect(client.isConnected()).toBe(true);
    });

    it("should return false if session is not set", () => {
      const client = new AvanzaClient({
        fetch,
      });

      expect(client.isConnected()).toBe(false);
    });
  });

  it("can set baseUrl with options", () => {
    const url = "https://www.myurl.se";
    const client = new AvanzaClient({ baseUrl: url, fetch });
    expect(client.baseUrl).toEqual(url);
  });
  it("default baseUrl to AVANZA_URL", () => {
    const client = new AvanzaClient({ fetch });
    expect(client.baseUrl).toEqual(AVANZA_URL);
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
      const client = new AvanzaClient({ fetch });
      expect(client.getDefaultHeaders()).toEqual({
        "Content-Type": "application/json",
      });
    });
    it("returns default headers with session", () => {
      const client = new AvanzaClient({ fetch });
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

  describe("setSession", () => {
    it("sets session", () => {
      const client = new AvanzaClient({ fetch });
      client.setSession({
        authenticationSession: "authenticationSession-123",
        customerId: "123",
        pushSubscriptionId: "123",
        registrationComplete: true,
        securityToken: "security",
      });
      // @ts-expect-error
      expect(client.session).toEqual({
        authenticationSession: "authenticationSession-123",
        customerId: "123",
        pushSubscriptionId: "123",
        registrationComplete: true,
        securityToken: "security",
      });
    });

    it("calls onSessionChange", () => {
      const onSessionChange = jest.fn();
      const client = new AvanzaClient({ fetch, onSessionChange });
      client.setSession({
        authenticationSession: "authenticationSession-123",
        customerId: "123",
        pushSubscriptionId: "123",
        registrationComplete: true,
        securityToken: "security",
      });
      expect(onSessionChange).toHaveBeenCalledWith({
        authenticationSession: "authenticationSession-123",
        customerId: "123",
        pushSubscriptionId: "123",
        registrationComplete: true,
        securityToken: "security",
      });
    });
  });

  describe("disconnect", () => {
    it("clears session", () => {
      const client = new AvanzaClient({ fetch });
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

    it("calls onSessionChange", () => {
      const onSessionChange = jest.fn();
      const client = new AvanzaClient({ fetch, onSessionChange });

      client.disconnect();
      expect(onSessionChange).toHaveBeenCalledWith(undefined);
    });
  });
});
