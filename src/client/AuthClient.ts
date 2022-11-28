import { AvanzaSession } from "./auth_types";
import { AvanzaClient } from "./AvanzaClient";
import {
  AuthenticateBankIDResponse,
  AuthenticateBankIDStatusResponse,
  AuthenticateBankIDStatusResponseComplete,
  AuthenticationSessionTOPTResponse,
  BankIDAuthState,
} from "./types";

export interface Session {
  securityToken: string;
  authenticationSession: string;
  customerId: string;
  pushSubscriptionId: string;
  registrationComplete: boolean;
}

export class AuthClient {
  private readonly client: AvanzaClient;

  constructor(client: AvanzaClient) {
    this.client = client;
  }

  async getSession(): Promise<AvanzaSession> {
    const response = await this.client.get("/_cqbe/authentication/session", {});
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const data = (await response.json()) as AvanzaSession;
    return data;
  }

  /**
   * Authenticate with Avanza using BankID
   * takes a social security number as input
   * and will call the callback with a QR code string that can be rendered as a QR code to be scanned.
   * You need to manually render the QR code to your user, callback will only return the code as a string.
   */
  async authenticateWithBankID(
    socialSecurityNumber: string,
    onQRCode: (qrCode: string) => void,
    opts: { pollInterval?: number } = {}
  ): Promise<AuthenticateBankIDStatusResponseComplete> {
    const { pollInterval = 2000 } = opts;
    const response = await this.client.post(
      "/_api/authentication/sessions/bankid",
      {
        body: {
          socialSecurityNumber,
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const data = (await response.json()) as AuthenticateBankIDResponse;
    onQRCode(`bankid:///?autostarttoken=${data.autostartToken}`);

    const success = await this.pollForBankIDAuthenticationStatus(
      data.transactionId,
      new Date(data.expires),
      pollInterval
    );

    const session = await this.getSessionFromBankIDResponse(success);
    this.client.setSession(session);
    return success;
  }

  async getSessionFromBankIDResponse(
    success: AuthenticateBankIDStatusResponseComplete
  ): Promise<Session> {
    if (success.logins.length <= 0) {
      throw new Error("No logins found");
    }
    if (success.logins.length > 1) {
      throw Error("Multiple logins not supported");
    }
    const login = success.logins[0].loginPath;
    const response = await this.client.get(login, {});
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const securityToken = response.headers.get("x-securitytoken");
    if (!securityToken) {
      throw new Error("No security token found");
    }
    const data = (await response.json()) as AuthenticationSessionTOPTResponse;
    if (!data.registrationComplete) {
      throw new Error("Registration not complete");
    }
    if (
      data.authenticationSession &&
      data.pushSubscriptionId &&
      data.customerId
    ) {
      return {
        ...data,
        securityToken,
      };
    } else {
      throw new Error("Unknown authentication response");
    }
  }

  private async pollForBankIDAuthenticationStatus(
    transactionId: string,
    expires: Date,
    pollInterval: number
  ): Promise<AuthenticateBankIDStatusResponseComplete> {
    if (new Date() > expires) {
      throw new Error("BankID authentication expired");
    }
    const response = await this.client.get(
      "/_api/authentication/sessions/bankid/collect",
      {
        headers: {
          Cookie: `AZABANKIDTRANSID=${transactionId}`,
        },
      }
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const data = (await response.json()) as AuthenticateBankIDStatusResponse;
    if (data.state === BankIDAuthState.COMPLETE) {
      return data;
    }
    if (data.state === BankIDAuthState.OUTSTANDING_TRANSACTION) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      return await this.pollForBankIDAuthenticationStatus(
        transactionId,
        expires,
        pollInterval
      );
    }
    throw new Error("Unknown BankID authentication state: " + data.state);
  }
}
