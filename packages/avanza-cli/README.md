# avanza-cli

Command-line interface for `avanza-ts`.

## Output formats

Commands supporting structured output accept `--json` for the response body:

```sh
avanza auth session --json
```

Add `--fields` to print only selected comma-separated JSON fields.
Use dotted paths to select properties from nested objects or every item in an array:

```sh
avanza auth session --json --fields user.greetingName,user.loggedIn
avanza instruments stocks --json --fields stocks.name,stocks.lastPrice,totalNumberOfOrderbooks
avanza instruments sectors --json --fields sector.sectorName
```

`--json` alone keeps the full response. Unknown fields are rejected. Field selection happens after
JSON redaction and never changes `--fixture` output.

`--fixture` prints the HTTP request and response as JSON. Use `--output` to write to a new temporary
file instead of stdout:

```sh
avanza auth session --fixture
capture_dir=$(mktemp -d)
avanza auth session --fixture --output "$capture_dir/raw.json"
```

`--json` and `--fixture` cannot be combined. `--output` requires `--fixture` and never overwrites a
file. Anonymize captured data before adding it to tracked fixtures, and remove temporary captures
after use.

## Accounts and positions (read only)

Sign in first with `avanza auth totp` or `avanza auth bankid`. All of these commands send GET requests only and use the stored session:

```sh
avanza accounts list --json
avanza accounts closed
avanza accounts has-closed
avanza accounts categories
avanza accounts overview --account-id <url-parameter-id>
avanza accounts categorized-overview
avanza accounts trading
avanza accounts trading-with-positions
avanza accounts lightweight
avanza positions list --account-id <url-parameter-id>
avanza positions countries --account-id <url-parameter-id>
avanza positions tools
avanza positions orderbooks --orderbook-ids 123,456
avanza positions statistics --orderbook-id 123
avanza positions popular-statistics --orderbook-id 123
```

`positions list` and `positions countries` also work without `--account-id`. `--fixture` includes raw personal account and holdings data; keep captures private and anonymize before tracking them.

## Performance and transactions (read only)

These commands also need a stored session. The performance commands send query-only POST requests; the transaction commands send GET requests only:

```sh
avanza performance chart --period ONE_YEAR
avanza performance chart --from 2025-01-01 --to 2025-06-30 --account-ids <id>,<id>
avanza performance total-values
avanza transactions list --from 2025-01-01 --types BUY,SELL
avanza transactions pending
avanza transactions show --account-id <url-parameter-id> --transaction-id <id>
avanza transactions dividends --include-closed
avanza transactions upcoming-dividends
```

Omitting `--account-ids` includes all accounts. `transactions list` defaults to the last year. `--fixture` includes raw personal balances and transactions; keep captures private and anonymize before tracking them.

## Market data (read only)

These commands work without a session, except `market data`, which uses the stored session. `market search` sends a query-only POST request; the rest send GET requests only:

```sh
avanza market search --query volvo --types STOCK,EXCHANGE_TRADED_FUND --limit 5
avanza market isin --isin SE0000115446
avanza market stock --orderbook-id 5269
avanza market analysis --orderbook-id 5269
avanza market marketplace --orderbook-id 5269
avanza market owners --orderbook-id 5269
avanza market news --orderbook-id 5269
avanza market insider-trades --orderbook-id 5269
avanza market instrument --type certificate --orderbook-id 563966
avanza market instrument-details --type warrant --orderbook-id 2634687
avanza market market-maker-chart --orderbook-id 563966 --period one_week
avanza market quote --orderbook-id 5269
avanza market order-depth --orderbook-id 5269
avanza market trades --orderbook-id 5269
avanza market broker-trades --orderbook-id 5269
avanza market data --orderbook-id 5269
avanza market indices
avanza market constituents --orderbook-id 19002
avanza market etf --orderbook-id 5510
avanza market etf-details --orderbook-id 5510
avanza market overviews
avanza market chart --orderbook-id 5269 --period one_month
avanza market chart-periods --orderbook-id 5269
avanza market price-chart --orderbook-id 5269 --period one_year --resolution week
avanza market price-chart --orderbook-id 5269 --from 2026-01-01 --to 2026-06-30
avanza market company-events --orderbook-id 5269
avanza market insider-transactions --orderbook-id 5269
avanza market short-selling --orderbook-id 5269
avanza market technical-analysis --orderbook-id 5269 --period one_month --points 20
```

Use `market search` or `market isin` to find orderbook IDs; the `instruments` screeners list certificate, warrant, and option IDs. Available `--resolution` values depend on the period; `price-chart` returns them in `metadata.resolution`.

## Funds (read only)

These commands work without a session, except `funds favourites` and `funds is-favourite`. `funds search` and `funds list` send query-only POST requests; the rest send GET requests only:

```sh
avanza funds search --name zero
avanza funds lookup --query zero
avanza funds list --filter '{"riskFilter":["2"]}' --sort-field developmentOneYear --limit 10
avanza funds top-ten --sort-field developmentOneYear --type BOTH
avanza funds orderbook --orderbook-id 41567
avanza funds details --orderbook-id 41567
avanza funds holdings --orderbook-id 41567
avanza funds regions --orderbook-id 41567
avanza funds sectors --orderbook-id 41567
avanza funds chart --orderbook-id 41567 --period three_years
avanza funds chart-periods --orderbook-id 41567
avanza funds reference --orderbook-id 41567
avanza funds development --orderbook-id 41567
avanza funds portfolio --orderbook-id 41567
avanza funds sustainability --orderbook-id 41567
avanza funds favourites
avanza funds is-favourite --orderbook-id 41567
```

`funds list` returns `filterCounts`; use their `type` and `title` values to build `--filter` keys such as `riskFilter` or `companyFilter`.

## News and events (read only)

`news article` works without a session; `news feed` and `news calendar` use the stored session. All send GET requests only:

```sh
avanza news feed --limit 5 --max-days 7
avanza news article --url https://www.placera.se/telegram/avanza/<id>
avanza news calendar
```

`news article` takes the `url` of a `news feed` item.

## Orders and trading status (read only)

These commands use the stored session and send GET requests only:

```sh
avanza orders count
avanza orders active-ids
avanza orders bulk-orders --side BUY
avanza orders bulk-order --bulk-order-id <id>
avanza orders stop-losses --orderbook-id 5269
avanza orders stop-loss --account-id <url-parameter-id> --stop-loss-id <id>
avanza orders orderbook --orderbook-id 5269
avanza orders exchange-rates
avanza orders market-status --country US --date 2026-09-23
```

## Watchlists, alerts, and notes (read only)

These commands use the stored session. `watchlist-data` and `watchlist-news` send query-only POST requests; the rest send GET requests only:

```sh
avanza collections watchlists
avanza collections watchlist-data --watchlist-id <id> --data-points LAST_PRICE,ONE_YEAR_PERFORMANCE,NUMBER_OF_OWNERS
avanza collections watchlist-news --watchlist-id <id>
avanza collections alerts
avanza collections triggered-alerts
avanza collections notes --orderbook-id 5269
avanza collections note-orderbooks
```

`watchlist-data` and `watchlist-news` use every instrument in the watchlist unless `--orderbook-ids` narrows it. `--fixture` captures include personal watchlists and notes; keep them private.

## Savings, credit, and pensions (read only)

These commands use the stored session and send GET requests only:

```sh
avanza savings periodic
avanza savings recurring-deposits
avanza savings categories
avanza savings goal-health --category-id <id>
avanza savings goal-performance --category-id <id> --period THREE_YEARS
avanza savings credit-accounts
avanza savings pension --account-id <id>
avanza savings pension-distribution --account-id <id>
avanza savings payout-plans
avanza savings payout-plan --account-id <id>
```

`savings categories` lists category IDs and numeric account IDs. Pension details include personal names and customer IDs; keep `--fixture` captures private.

## Stock screener

```sh
avanza instruments stocks --limit 10 --sort-field numberOfOwners --order desc --json
avanza instruments stocks --filter '{"marketPlaces":["se"],"sectors":["38"]}' --offset 20
avanza instruments theme-stocks --orderbook-ids 5361,1234 --sort-field numberOfOwners --order desc --json
avanza instruments gainers-losers --filter '{"marketPlaces":["se"]}' --json
avanza instruments stock-options --json
avanza instruments sectors --popular --json
avanza instruments sectors --json
```

These public commands also support `--fixture --output <new-temporary-file>`. Fixture output contains
the raw HTTP response: anonymize it before adding it to the repository.

### ETFs, certificates, warrants, and derivatives

These public commands send query-only POST requests (screens) or GET requests (options). Filter keys and values come from the matching options command:

```sh
avanza instruments etf-options --json
avanza instruments etfs --filter '{"issuers":["xact"]}' --limit 10
avanza instruments certificate-options --json
avanza instruments certificates --filter '{"directions":["long"]}' --sort-field totalValueTraded
avanza instruments warrant-options --json
avanza instruments warrants --filter '{"subTypes":["turbo"]}' --offset 20
avanza instruments derivative-options --json
```

After signing in, the following settings commands use the stored session:

```sh
avanza instruments metadata --json
avanza instruments tabs list --json
avanza instruments tabs save --data '[{"name":"My tab","columns":["NUMBER_OF_OWNERS"]}]'
avanza instruments tabs delete
avanza instruments filters list --json
avanza instruments filters save --data '[{"name":"Sweden","filter":{"marketPlaces":["se"]}}]'
```

Save commands replace the complete collection; `tabs delete` deletes all custom tabs.

## Authentication

### TOTP

```sh
avanza auth totp
```

The command prompts for missing credentials. Passwords and TOTP codes are masked. Environment
variables can provide credentials for non-interactive use:

| Variable             | Description                               |
| -------------------- | ----------------------------------------- |
| `AVANZA_USERNAME`    | Avanza username                           |
| `AVANZA_PASSWORD`    | Avanza password                           |
| `AVANZA_TOTP_CODE`   | Current six-digit TOTP code               |
| `AVANZA_TOTP_SECRET` | Base32 TOTP secret used to generate codes |

Set exactly one of `AVANZA_TOTP_CODE` and `AVANZA_TOTP_SECRET`. Credentials used to authenticate are
not stored; only the resulting Avanza session is persisted.

### BankID

```sh
avanza auth bankid
```

BankID authentication requires an interactive terminal. The command displays a QR code and refreshes
it until the attempt completes, expires, is denied, or is cancelled with Ctrl+C.

### Session status

```sh
avanza auth session
```

This validates the stored session with Avanza and prints a redacted summary. Missing, expired, or
invalid sessions are reported as normal status results.

### Logout

```sh
avanza auth logout
```

Logout removes the local credential even when the remote Avanza logout request fails.

## Session storage

Sessions are stored as one `avanza-cli` credential in the operating system credential store:

- macOS Keychain
- Windows Credential Manager
- Linux Secret Service, such as GNOME Keyring, KWallet, or KeePassXC

Linux requires a running Secret Service provider. The CLI deliberately does not fall back to the
non-persistent Linux kernel keyring.
