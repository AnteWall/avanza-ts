import { AccountsClient } from './accounts/accounts-client.js';
import { AuthClient } from './auth/auth-client.js';
import type { AvanzaSession } from './auth/session.js';
import { InstrumentsClient } from './instruments/instruments-client.js';
import { HttpClient } from './internal/http-client.js';
import { MarketClient } from './market/market-client.js';
import { OrdersClient } from './orders/orders-client.js';
import { PositionsClient } from './positions/positions-client.js';
import { WebSocketClient } from './websocket/websocket-client.js';

export interface AvanzaClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly session?: AvanzaSession;
}

export class AvanzaClient {
  readonly #http: HttpClient;
  #session: AvanzaSession | undefined;

  public readonly accounts: AccountsClient;
  public readonly auth: AuthClient;
  public readonly instruments: InstrumentsClient;
  public readonly market: MarketClient;
  public readonly orders: OrdersClient;
  public readonly positions: PositionsClient;
  public readonly websocket: WebSocketClient;

  public constructor(options: AvanzaClientOptions = {}) {
    this.#session = options.session;
    this.#http = new HttpClient({
      ...(options.baseUrl === undefined ? {} : { baseUrl: options.baseUrl }),
      ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
      getSession: () => this.#session,
      updateSession: (session) => this.setSession(session),
    });

    const context = {
      createHttpSession: (cookies = []) => this.#http.createIsolatedSession(cookies),
      http: this.#http,
      session: {
        clear: () => this.clearSession(),
        get: () => this.#session,
        set: (session: AvanzaSession) => this.setSession(session),
      },
    };

    this.accounts = new AccountsClient(context);
    this.auth = new AuthClient(context);
    this.instruments = new InstrumentsClient(context);
    this.market = new MarketClient(context);
    this.orders = new OrdersClient(context);
    this.positions = new PositionsClient(context);
    this.websocket = new WebSocketClient(context);
  }

  public get session(): AvanzaSession | undefined {
    return this.#session;
  }

  public setSession(session: AvanzaSession): void {
    this.#session = session;
  }

  public clearSession(): void {
    this.#session = undefined;
  }
}
