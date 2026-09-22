import { describe, expect, it } from 'vitest';

import { AccountsClient } from './accounts/accounts-client.js';
import { AuthClient } from './auth/auth-client.js';
import type { AvanzaSession } from './auth/session.js';
import { AvanzaClient } from './client.js';
import { InstrumentsClient } from './instruments/instruments-client.js';
import { MarketClient } from './market/market-client.js';
import { OrdersClient } from './orders/orders-client.js';
import { WebSocketClient } from './websocket/websocket-client.js';

const session: AvanzaSession = {
  authenticationSession: 'authentication-session',
  mode: 'totp',
  securityToken: 'security-token',
};

describe('AvanzaClient', () => {
  it('creates one client for every domain', () => {
    const client = new AvanzaClient();

    expect(client.accounts).toBeInstanceOf(AccountsClient);
    expect(client.auth).toBeInstanceOf(AuthClient);
    expect(client.instruments).toBeInstanceOf(InstrumentsClient);
    expect(client.market).toBeInstanceOf(MarketClient);
    expect(client.orders).toBeInstanceOf(OrdersClient);
    expect(client.websocket).toBeInstanceOf(WebSocketClient);
    expect(client.accounts).toBe(client.accounts);
  });

  it('manages a mutable in-memory session', () => {
    const client = new AvanzaClient({ session });

    expect(client.session).toBe(session);

    const replacement: AvanzaSession = {
      authenticationSession: 'replacement-authentication-session',
      mode: 'totp',
      securityToken: 'replacement-security-token',
    };
    client.setSession(replacement);

    expect(client.session).toBe(replacement);

    client.clearSession();

    expect(client.session).toBeUndefined();
  });

  it('does not share sessions between client instances', () => {
    const authenticatedClient = new AvanzaClient({ session });
    const publicClient = new AvanzaClient();

    authenticatedClient.clearSession();
    publicClient.setSession(session);

    expect(authenticatedClient.session).toBeUndefined();
    expect(publicClient.session).toBe(session);
  });
});
