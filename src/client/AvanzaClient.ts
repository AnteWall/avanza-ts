import type {
  Fetcher,
  FetcherRequestInit,
  FetcherResponse,
} from "@apollo/utils.fetcher";
import { sanitizeUrlPath } from "../utils/url";
import { AccountClient } from "./AccountClient";
import { AuthClient, Session } from "./AuthClient";
import { AuthenticateBankIDStatusResponseComplete } from "./types";

export const AVANZA_URL = "https://www.avanza.se";

export interface AvanzaClientOptions {
  baseUrl?: string;
  fetch: Fetcher;
}

export class AvanzaClient {
  readonly baseUrl: string;
  readonly fetch: Fetcher;
  readonly auth: AuthClient;
  readonly account: AccountClient;
  private session?: Session;

  constructor(options?: AvanzaClientOptions) {
    this.baseUrl = options?.baseUrl || AVANZA_URL;
    this.fetch = options.fetch;
    this.auth = new AuthClient(this);
    this.account = new AccountClient(this);
  }

  /**
   * Authenticate with Avanza using BankID
   * takes a social security number as input
   * and will call the callback with a QR code string that can be rendered as a QR code to be scanned.
   * You need to manually render the QR code to your user, callback will only return the code as a string.
   */
  public async authenticateWithBankID(
    socialSecurityNumber: string,
    onQRCode: (qrCode: string) => void
  ): Promise<AuthenticateBankIDStatusResponseComplete> {
    return await this.auth.authenticateWithBankID(
      socialSecurityNumber,
      onQRCode
    );
  }

  async post(
    path: string,
    args: Omit<FetcherRequestInit, "body"> & { body: object }
  ): Promise<FetcherResponse> {
    const { body, headers, ...otherArgs } = args;

    const response = await this.fetch(sanitizeUrlPath(this.baseUrl, path), {
      method: "POST",
      headers: {
        ...this.getDefaultHeaders(),
        ...headers,
      },
      body: JSON.stringify(body),
      ...otherArgs,
    });

    return response;
  }

  async get(
    path: string,
    args: Omit<FetcherRequestInit, "body"> & { params?: Record<string, string> }
  ): Promise<FetcherResponse> {
    const { params, headers, ...otherArgs } = args;

    const response = await this.fetch(
      sanitizeUrlPath(this.baseUrl, path, params),
      {
        method: "GET",
        headers: {
          ...this.getDefaultHeaders(),
          ...headers,
        },
        ...otherArgs,
      }
    );

    return response;
  }

  getDefaultHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "X-SecurityToken": this.session && this.session.securityToken,
      "X-AuthenticationSession":
        this.session && this.session.authenticationSession,
    };
  }

  setSession(session: Session) {
    this.session = session;
  }

  disconnect() {
    this.session = undefined;
  }
}