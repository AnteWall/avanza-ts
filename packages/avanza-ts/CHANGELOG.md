# avanza-ts

## 1.2.0

### Minor Changes

- 91114f9: Add live data from Avanza's push (Server-Sent Events) endpoints. `client.push` streams quotes, order depth, trades, trading state, warrant leverage, off-hours prices, and your own orders, deals, and stop-losses as async iterators that reconnect automatically. The new `avanza push` commands (`quotes`, `order-depth`, `trades`, `trade-state`, `orders`, `deals`) print each event as a JSON line until Ctrl-C.

  Push streams are sent over HTTP/2 through undici, because Avanza refuses them over HTTP/1.1. A custom `fetch` passed to `AvanzaClient` is also used for push streams and must support HTTP/2.

  The minimum Node.js version is now 22.19.0, required by undici 8. The empty `client.websocket` placeholder has been removed; use `client.push` instead.

## 1.1.0

### Minor Changes

- 06c556e: Add analyst data (consensus estimates, recommendations, price targets, Morningstar, and Placera/Affärsvärlden/Kepler analyses), portfolio analytics (key ratios, average-customer and instrument comparison, yearly summary, stock key ratios, fund look-through, interest rates), and news and community data (news screener, Placera forum posts and stats).

## 1.0.2

### Patch Changes

- c99aa82: Persist TOTP login cookies so authenticated account requests no longer return 401.

## 1.0.1

### Patch Changes

- 9648076: Accept empty push subscription IDs in successful TOTP login responses.

## 1.0.0

First 1.0.0 release of the TypeScript SDK from this repository.
