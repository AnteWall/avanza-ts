import { AuthClient } from "./AuthClient";
import { AvanzaClient, AVANZA_URL } from "./AvanzaClient";
import {
  AccountType,
  AuthenticateBankIDResponse,
  AuthenticateBankIDStatusResponseActive,
  AuthenticateBankIDStatusResponseComplete,
  AuthenticationSessionTOPTResponse,
  BankIDAuthState,
} from "./types";
import nock from "nock";

describe("AuthClient", () => {
  describe("authenticateWithBankID", () => {
    it("complete with successful flow", async () => {
      const transactionId = "transactionId-123";
      nock(AVANZA_URL)
        .post("/_api/authentication/sessions/bankid")
        .reply(200, {
          autostartToken: "autostartToken-123",
          transactionId: transactionId,
          expires: new Date(new Date().getTime() + 10000).toISOString(),
        } as AuthenticateBankIDResponse);
      nock(AVANZA_URL)
        .get("/_api/authentication/sessions/bankid/collect")
        .matchHeader("cookie", `AZABANKIDTRANSID=${transactionId}`)
        .once()
        .reply(200, {
          state: BankIDAuthState.OUTSTANDING_TRANSACTION,
          transactionId: transactionId,
        } as AuthenticateBankIDStatusResponseActive);
      nock(AVANZA_URL)
        .get("/_api/authentication/sessions/bankid/collect")
        .matchHeader("cookie", `AZABANKIDTRANSID=${transactionId}`)
        .once()
        .reply(200, {
          state: BankIDAuthState.COMPLETE,
          transactionId: transactionId,
          name: "name-123",
          identificationNumber: "identificationNumber-123",
          logins: [
            {
              accounts: [
                {
                  accountName: "accountName-123",
                  accountType: AccountType.AKTIE_FOND_KONTO,
                },
              ],
              customerId: "customerId-123",
              loginPath: "loginPath-123",
              username: "username-123",
            },
          ],
          recommendedTargetCustomers: [],
        } as AuthenticateBankIDStatusResponseComplete);
      nock(AVANZA_URL)
        .get("/loginPath-123")
        .once()

        .reply(
          200,
          {
            authenticationSession: "authenticationSession-123",
            customerId: "customerId-123",
            pushSubscriptionId: "pushSubscriptionId-123",
            registrationComplete: true,
          } as AuthenticationSessionTOPTResponse,
          {
            "x-securitytoken": "x-securitytoken-123",
          }
        );
      let qrCode = "";
      const client = new AuthClient(new AvanzaClient());
      const res = await client.authenticateWithBankID("123456789", (q) => {
        qrCode = q;
      });
      expect(qrCode).toBe("bankid:///?autostarttoken=autostartToken-123");
      expect(res.name).toBe("name-123");
      expect(res.identificationNumber).toBe("identificationNumber-123");
      expect(res.logins[0].accounts[0].accountName).toBe("accountName-123");
    });

    it("throws on empty logins", async () => {
      const transactionId = "transactionId-123";
      nock(AVANZA_URL)
        .post("/_api/authentication/sessions/bankid")
        .reply(200, {
          autostartToken: "autostartToken-123",
          transactionId: transactionId,
          expires: new Date(new Date().getTime() + 10000).toISOString(),
        } as AuthenticateBankIDResponse);
      nock(AVANZA_URL)
        .get("/_api/authentication/sessions/bankid/collect")
        .matchHeader("cookie", `AZABANKIDTRANSID=${transactionId}`)
        .once()
        .reply(200, {
          state: BankIDAuthState.OUTSTANDING_TRANSACTION,
          transactionId: transactionId,
        } as AuthenticateBankIDStatusResponseActive);
      nock(AVANZA_URL)
        .get("/_api/authentication/sessions/bankid/collect")
        .matchHeader("cookie", `AZABANKIDTRANSID=${transactionId}`)
        .once()
        .reply(200, {
          state: BankIDAuthState.COMPLETE,
          transactionId: transactionId,
          name: "name-123",
          identificationNumber: "identificationNumber-123",
          logins: [],
          recommendedTargetCustomers: [],
        } as AuthenticateBankIDStatusResponseComplete);

      const client = new AuthClient(new AvanzaClient());
      await expect(
        client.authenticateWithBankID("123456789", () => {})
      ).rejects.toThrow("No logins found");
    });

    it("throws on multiple logins", async () => {
      const transactionId = "transactionId-123";
      nock(AVANZA_URL)
        .post("/_api/authentication/sessions/bankid")
        .reply(200, {
          autostartToken: "autostartToken-123",
          transactionId: transactionId,
          expires: new Date(new Date().getTime() + 10000).toISOString(),
        } as AuthenticateBankIDResponse);
      nock(AVANZA_URL)
        .get("/_api/authentication/sessions/bankid/collect")
        .matchHeader("cookie", `AZABANKIDTRANSID=${transactionId}`)
        .once()
        .reply(200, {
          state: BankIDAuthState.OUTSTANDING_TRANSACTION,
          transactionId: transactionId,
        } as AuthenticateBankIDStatusResponseActive);
      nock(AVANZA_URL)
        .get("/_api/authentication/sessions/bankid/collect")
        .matchHeader("cookie", `AZABANKIDTRANSID=${transactionId}`)
        .once()
        .reply(200, {
          state: BankIDAuthState.COMPLETE,
          transactionId: transactionId,
          name: "name-123",
          identificationNumber: "identificationNumber-123",
          logins: [
            {
              accounts: [
                {
                  accountName: "accountName-123",
                  accountType: AccountType.AKTIE_FOND_KONTO,
                },
              ],
              customerId: "customerId-123",
              loginPath: "loginPath-123",
              username: "username-123",
            },
            {
              accounts: [
                {
                  accountName: "accountName-123",
                  accountType: AccountType.AKTIE_FOND_KONTO,
                },
              ],
              customerId: "customerId-123",
              loginPath: "loginPath-123",
              username: "username-123",
            },
          ],
          recommendedTargetCustomers: [],
        } as AuthenticateBankIDStatusResponseComplete);

      const client = new AuthClient(new AvanzaClient());
      await expect(
        client.authenticateWithBankID("123456789", () => {})
      ).rejects.toThrow("Multiple logins not supported");
    });
  });
});
