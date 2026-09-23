# avanza-ts

Reusable, ESM-first TypeScript SDK for Avanza.

> [!WARNING]
> This project uses an unofficial API that may change without notice. It is not affiliated with
> Avanza Bank AB.

## Client

`AvanzaClient` owns one HTTP transport, one mutable in-memory session, and domain clients that will
contain the individual API operations.

```ts
import { AvanzaClient, type AvanzaSession } from 'avanza-ts';

const session: AvanzaSession = {
  authenticationSession: process.env.AVANZA_AUTHENTICATION_SESSION!,
  mode: 'totp',
  securityToken: process.env.AVANZA_SECURITY_TOKEN!,
};

const client = new AvanzaClient({ session });

client.accounts;
client.auth;
client.instruments;
client.market;
client.orders;
client.websocket;
```

The stock screener and authentication endpoints are available; other domain clients establish the
SDK structure for future operations.

## Stock screener

```ts
const { stocks, totalNumberOfOrderbooks } = await client.instruments.screenStocks({
  filter: { marketPlaces: ['se'], sectors: ['38'], numberOfOwners: { minValue: 100 } },
  offset: 0,
  limit: 20,
  sortBy: { field: 'numberOfOwners', order: 'desc' },
});

const options = await client.instruments.getStockFilterOptions();
const theme = await client.instruments.getThemeStocks(['5361', '1234'], {
  field: 'numberOfOwners',
  order: 'desc',
});
const movers = await client.instruments.getGainersLosers({ marketPlaces: ['se'] });
```

The response includes pagination, filter options, and per-stock prices, performance, ownership,
fundamentals, and technical indicators. Requests and responses are validated with Zod. Stock sector
lists are available through `getPopularStockSectors()` and `getAllStockSectors()`.

With an authenticated session, `getStockScreenerMetadata()`, `getStockScreenerTabs()`, and
`getSavedStockFilters()` read personal settings. `saveStockScreenerTabs(tabs)` and
`saveStockFilters(filters)` replace their respective complete collections;
`deleteStockScreenerTabs()` deletes all custom tabs.

## Sessions

Session persistence does not belong to the SDK. Applications can load a session from their preferred
store, pass it to the constructor, and update the active session later.

```ts
client.setSession(session);
client.clearSession();
```

Sessions are discriminated by `mode`. TOTP sessions contain authentication headers, while BankID
sessions contain an RFC-compliant, JSON-serializable cookie snapshot and may contain a security
token. Authentication-required requests fail before making a network call when no session is
available.

Sessions contain sensitive credentials. Persist them only in a suitable credential store; do not log
them or commit them to source control.

## TOTP authentication

Log in with either the current six-digit code or the base32 secret used to generate it:

```ts
const session = await client.auth.loginWithTotp({
  username: process.env.AVANZA_USERNAME!,
  password: process.env.AVANZA_PASSWORD!,
  totpSecret: process.env.AVANZA_TOTP_SECRET!,
});
```

Use `totpCode` instead of `totpSecret` when code generation happens outside the SDK. The completed
session is returned and installed on `client.session`.

## BankID authentication

Starting BankID returns an attempt with the current QR payload and a same-device autostart URL:

```ts
const attempt = await client.auth.startBankId();

renderQr(attempt.challenge.qrPayload);

while (true) {
  await new Promise((resolve) => setTimeout(resolve, attempt.challenge.refreshAfterMs));
  const result = await attempt.poll();

  if (result.status === 'pending') {
    renderQr(result.challenge.qrPayload);
    continue;
  }
  if (result.status === 'complete') {
    console.log('Authenticated');
  }
  break;
}
```

`qrPayload` is the text to encode in a QR image; it is not an image URL. Avanza rotates it while the
attempt is pending, so callers must rerender the QR returned by each poll. The SDK deliberately does
not choose an SVG, PNG, terminal, or browser renderer. When Avanza supplies same-device autostart
metadata, `autostartUrl` uses the `bankid://` scheme.

Call `attempt.cancel()` when abandoning an in-progress login. Attempts default to a 120-second
overall timeout and suggest polling every 1.5 seconds.

## Session lifecycle

Restored sessions can be checked before use, and logout clears the local session even when remote
cleanup fails:

```ts
const valid = await client.auth.validateSession();

if (valid) {
  await client.auth.logout();
}
```

`getSessionInfo()` returns the raw session-info response. It sends the installed session when one is
available and otherwise makes the same request anonymously:

```ts
const info = await client.auth.getSessionInfo();
```

## Configuration

The client uses `https://www.avanza.se` and the Node.js global `fetch` implementation by default. Both
can be replaced, primarily for testing or routing through a controlled transport.

```ts
const client = new AvanzaClient({
  baseUrl: 'https://example.test',
  fetch: customFetch,
});
```
