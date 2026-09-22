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

The domain clients currently establish the SDK structure; endpoint methods will be added separately.

## Sessions

Session persistence does not belong to the SDK. Applications can load a session from their preferred
store, pass it to the constructor, and update the active session later.

```ts
client.setSession(session);
client.clearSession();
```

The request layer classifies endpoints as public, optionally authenticated, or authentication
required. Whenever the client has a session, its `X-AuthenticationSession` and `X-SecurityToken`
headers are sent for every request, including public requests. Authentication-required requests fail
before making a network call when no session is available.

## Configuration

The client uses `https://www.avanza.se` and the Node.js global `fetch` implementation by default. Both
can be replaced, primarily for testing or routing through a controlled transport.

```ts
const client = new AvanzaClient({
  baseUrl: 'https://example.test',
  fetch: customFetch,
});
```
