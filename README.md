# Avanza TypeScript & CLI

An unofficial TypeScript SDK and command-line tool for Avanza.

**Documentation:** [SDK guide](https://antewall.github.io/avanza-ts/docs/sdk/) · [CLI guide](https://antewall.github.io/avanza-ts/docs/cli/) · [Full documentation](https://antewall.github.io/avanza-ts/)

**For AI agents:** [llms.txt](https://antewall.github.io/avanza-ts/llms.txt) · [Full Markdown docs](https://antewall.github.io/avanza-ts/llms-full.txt)

Requires Node.js 22.12 or newer.

## TypeScript SDK — `avanza-ts`

Use the SDK in a Node.js application to access Avanza market data and authenticated account features.

```sh
npm install avanza-ts
```

```ts
import { AvanzaClient } from 'avanza-ts';

const client = new AvanzaClient();
const results = await client.market.search('volvo');
console.log(results);
```

Public market requests work without signing in. See the [SDK getting-started guide](https://antewall.github.io/avanza-ts/docs/sdk/getting-started) for more.

## CLI — `avanza-tools`

Install the `avanza` command on macOS, Linux, or Windows:

```sh
npm install --global avanza-tools
avanza market search --query volvo --limit 5
```

On macOS or Linux, you can also install with Homebrew: `brew install AnteWall/tap/avanza-tools`.

To use the CLI with an AI agent, install the skill in your project:

```sh
npx skills add AnteWall/avanza-ts --skill avanza-cli
```

See the [CLI getting-started guide](https://antewall.github.io/avanza-ts/docs/cli/getting-started) for other package managers and authentication, or the [agent skill guide](https://antewall.github.io/avanza-ts/docs/cli/skills) for more.

## Disclaimer

`avanza-ts` and `avanza-tools` are unofficial tools for Avanza's API. They are not affiliated with Avanza Bank AB. The underlying API can be taken down or changed without warning at any point in time.

The author of this software is not responsible for any indirect damages (foreseeable or unforeseeable), such as, if necessary, loss or alteration of or fraudulent access to data, accidental transmission of viruses or of any other harmful element, loss of profits or opportunities, the cost of replacement goods and services or the attitude and behavior of a third party.

## Development

Use Node.js 22.12 or newer and pnpm 12. The included Nix flake provides Node.js 22 and pnpm; run `direnv allow` to load it automatically.

```sh
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm format:check
pnpm typecheck
```

Run `pnpm dev` to watch both TypeScript packages. Use `pnpm changeset` to describe a publishable change.

## Releases

The SDK and CLI have independent versions and GitHub Releases. Add a changeset for each publishable change and merge it into `main`. The [version workflow](.github/workflows/version.yml) pushes version and changelog commits to a **Version Packages** PR; merge that PR to start the [release workflow](.github/workflows/release.yml). It checks, builds, and publishes changed packages to npm, then creates `avanza-ts@<version>` and/or `avanza-tools@<version>` GitHub Releases with their changelog entries. A CLI release waits for the SDK if both versions change together. Rerun **Release packages** manually on `main` to retry a partial release; published npm versions and existing GitHub Releases are skipped.

Run `pnpm --filter @avanza/docs dev` to work on the documentation locally. The docs build generates CLI topic pages from oclif help before exporting the static site. GitHub Pages deployment runs from `.github/workflows/docs.yml` (select **GitHub Actions** as the repository's Pages source).

The docs build also generates the [SDK API reference](https://antewall.github.io/avanza-ts/docs/sdk/reference/generated/) from the `avanza-ts` public entry point using TypeDoc. Run `pnpm --filter @avanza/docs generate:sdk` to refresh it locally.
