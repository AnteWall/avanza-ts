---
name: avanza-cli
description: Use the avanza-tools `avanza` CLI to answer questions about stocks, funds, ETFs, market data, portfolios, accounts, transactions, dividends, orders, watchlists, and savings. Use when a user asks to look up or analyze Avanza investment data, even if they don't mention the CLI. Covers command discovery, sign-in, structured output, and handling private financial data.
---

# Avanza CLI

Use `avanza` (the executable from the `avanza-tools` package) for Avanza data. This is an unofficial client, not affiliated with Avanza Bank AB. Prices and API availability may change; report the data returned rather than implying it is live or guaranteed.

## First steps

1. Check availability with `avanza --help`. If it is missing, tell the user to install it with `npm install -g avanza-tools` (Node.js 22.12+) or `brew install AnteWall/tap/avanza-tools`; don't install software without the user's permission.
2. Pick the narrowest command below. Check `avanza <topic> <command> --help` for required flags and accepted values. Use `avanza <topic> --help` to discover other commands.
3. Prefer `--json` for structured results. Use `--fields` (not `--columns`) to select only the JSON properties needed; see below. Do not assume every command supports these flags (auth sign-in and logout do not).
4. State the instrument and date/period behind any numbers; distinguish account-specific results from public market data. If the user asks for a trade, explain that this CLI has no buy/sell placement command; `orders` reads existing orders.

## Select fields from JSON

`--fields` requires `--json` and accepts comma-separated property names. Use dotted paths for nested objects or each item of an array:

```sh
avanza instruments stocks --json --fields stocks.name,stocks.lastPrice,totalNumberOfOrderbooks
avanza instruments sectors --json --fields sector.sectorName
avanza auth session --json --fields user.loggedIn # when signed in
```

Run the command with `--json` first to inspect its shape, then select fields that actually exist; unknown fields are rejected. `--fields` limits displayed output, not what the API returns, and never applies to `--fixture`. The CLI has no `--columns` flag.

## Find instruments and public market data

Start with a search to obtain an **orderbook ID** rather than guessing from a ticker or company name:

```sh
avanza market search --query volvo --types STOCK --limit 5 --json
avanza market isin --isin SE0000115446 --json
avanza market quote --orderbook-id 5269 --json
avanza market stock --orderbook-id 5269 --json
avanza market chart --orderbook-id 5269 --period one_month --json
avanza market price-chart --orderbook-id 5269 --period one_year --resolution week --json
avanza market chart-periods --orderbook-id 5269 --json
avanza market news --orderbook-id 5269 --json
avanza market indices --json
```

Use distinct commands for distinct responses: `quote` for a quote, `order-depth` for the book, `trades` for prints, `owners` for ownership, `analysis` or `technical-analysis` for analysis, `company-events` for events, and `insider-transactions` or `short-selling` for those datasets. Chart periods and supported price-chart resolutions depend on the instrument; use `chart-periods` or inspect the returned `metadata.resolution` instead of inventing values. Public market commands generally work without sign-in; `market data` requires a session.

## Find funds and screen instruments

```sh
avanza funds search --name zero --json
avanza funds details --orderbook-id 41567 --json
avanza funds holdings --orderbook-id 41567 --json
avanza funds chart --orderbook-id 41567 --period three_years --json
avanza funds sustainability --orderbook-id 41567 --json
avanza instruments stocks --limit 10 --sort-field numberOfOwners --order desc --json
avanza instruments sectors --json --fields sector.sectorName
avanza instruments etf-options --json
avanza instruments etfs --filter '{"issuers":["xact"]}' --limit 10 --json
```

`funds lookup`, `funds list`, `funds top-ten`, `funds regions`, `funds sectors`, and `funds development` cover other fund questions. For screeners, query the matching `stock-options`, `etf-options`, `certificate-options`, `warrant-options`, or `derivative-options` command to discover valid filter values before calling `stocks`, `etfs`, `certificates`, `warrants`, or `derivatives`. `funds list` includes `filterCounts` to help construct fund filters. Screeners are public; `funds favourites` and `funds is-favourite` require sign-in.

## Private data and authentication

Only access personal data when the user asks for it. Check `avanza auth session --json` first; a status such as `not_signed_in`, `expired_session`, or `invalid_session` means authentication is needed. Ask the user to run `avanza auth bankid` in their own interactive terminal (QR code) or `avanza auth totp` (masked prompts). Do not ask the user to paste passwords, TOTP codes/secrets, BankID data, session tokens, or raw account responses into chat. The session is stored in the OS credential store; `avanza auth logout` clears it. Never print or relay raw credential environment variables.

```sh
avanza accounts list --json
avanza accounts overview --account-id <url-parameter-id> --json
avanza positions list --account-id <url-parameter-id> --json
avanza performance chart --period ONE_YEAR --json
avanza performance total-values --json
avanza transactions list --from 2025-01-01 --types BUY,SELL --json
avanza transactions dividends --include-closed --json
avanza transactions upcoming-dividends --json
avanza orders list --json
avanza collections watchlists --json
avanza savings periodic --json
```

Take account IDs from `accounts list`, not from a displayed account number; `--account-id` expects the URL parameter ID. `positions list` can omit `--account-id` for all accounts. `performance chart` also supports `--from YYYY-MM-DD --to YYYY-MM-DD --account-ids id,id`; transactions default to the past year if dates are omitted. Use `news feed` and `news calendar` for personal news/events; `news article --url <feed-item-url>` is public. For other account, position, order, collection, pension, or savings commands, discover the exact syntax with `--help`.

## Output and boundaries

- The CLI's `--json` response is structured but only explicitly designated secrets are redacted. Treat account details, positions, transactions, names, and notes as private: select only what the user needs and avoid saving or sharing raw output.
- `--fixture` captures raw HTTP requests and responses, potentially including credentials and personal data. Do not use it for ordinary research or display it in chat. `--fixture` and `--json` are exclusive; `--output` is only for fixture captures.
- Most data commands read data (some use query-only POST). `instruments tabs save`, `instruments tabs delete`, and `instruments filters save` change stored settings; only run them for an explicit user request. Saving tabs or filters replaces the entire collection, and deleting tabs removes all custom tabs.
- Do not confuse a fetched order or stop-loss with placing one. Do not manufacture missing values or give a financial recommendation as though it came from Avanza.

For the complete command inventory and up-to-date examples, see [the CLI documentation](https://antewall.github.io/avanza-ts/docs/cli/) or run `avanza --help`.
