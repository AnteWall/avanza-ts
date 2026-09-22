# avanza-cli

Command-line interface for `avanza-ts`.

## Output formats

Commands supporting structured output accept `--json` for the response body:

```sh
avanza auth session --json
```

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

## Stock screener

```sh
avanza instruments stocks --limit 10 --sort-field numberOfOwners --order desc --json
avanza instruments stocks --filter '{"marketPlaces":["se"],"sectors":["38"]}' --offset 20
avanza instruments stock-options --json
avanza instruments sectors --popular --json
avanza instruments sectors --json
```

These public commands also support `--fixture --output <new-temporary-file>`. Fixture output contains
the raw HTTP response: anonymize it before adding it to the repository.

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
