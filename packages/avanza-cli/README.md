# avanza-cli

Command-line interface for `avanza-ts`.

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
invalid sessions are reported as normal status results. Session credentials, cookies, and security
tokens are never printed.

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
