# avanza-tools

## 1.2.0

### Minor Changes

- 91114f9: Add live data from Avanza's push (Server-Sent Events) endpoints. `client.push` streams quotes, order depth, trades, trading state, warrant leverage, off-hours prices, and your own orders, deals, and stop-losses as async iterators that reconnect automatically. The new `avanza push` commands (`quotes`, `order-depth`, `trades`, `trade-state`, `orders`, `deals`) print each event as a JSON line until Ctrl-C.

  Push streams are sent over HTTP/2 through undici, because Avanza refuses them over HTTP/1.1. A custom `fetch` passed to `AvanzaClient` is also used for push streams and must support HTTP/2.

  The minimum Node.js version is now 22.19.0, required by undici 8. The empty `client.websocket` placeholder has been removed; use `client.push` instead.

### Patch Changes

- Updated dependencies [91114f9]
  - avanza-ts@1.2.0

## 1.1.0

### Minor Changes

- 06c556e: Add analyst data (consensus estimates, recommendations, price targets, Morningstar, and Placera/Affärsvärlden/Kepler analyses), portfolio analytics (key ratios, average-customer and instrument comparison, yearly summary, stock key ratios, fund look-through, interest rates), and news and community data (news screener, Placera forum posts and stats).

### Patch Changes

- Updated dependencies [06c556e]
  - avanza-ts@1.1.0

## 1.0.2

### Patch Changes

- 5de1e19: Add an installable Avanza CLI agent skill and document CLI and skill installation.

## 1.0.1

### Patch Changes

- c7b2fe6: Reject authenticated CLI commands without a stored session before making a request, and clear expired sessions on a 401 with a concise sign-in message.

## 1.0.0

First release of the Avanza command-line tools.
