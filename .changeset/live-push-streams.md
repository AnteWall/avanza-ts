---
'avanza-ts': minor
'avanza-tools': minor
---

Add live data from Avanza's push (Server-Sent Events) endpoints. `client.push` streams quotes, order depth, trades, trading state, warrant leverage, off-hours prices, and your own orders, deals, and stop-losses as async iterators that reconnect automatically. The new `avanza push` commands (`quotes`, `order-depth`, `trades`, `trade-state`, `orders`, `deals`) print each event as a JSON line until Ctrl-C.

Push streams are sent over HTTP/2 through undici, because Avanza refuses them over HTTP/1.1. A custom `fetch` passed to `AvanzaClient` is also used for push streams and must support HTTP/2.

The minimum Node.js version is now 22.19.0, required by undici 8. The empty `client.websocket` placeholder has been removed; use `client.push` instead.
