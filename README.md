# Avanza TypeScript

A pnpm workspace containing an Avanza SDK and an oclif-based CLI.

## Disclaimer

`avanza-ts` and `avanza-cli` are unofficial tools for Avanza's API. They are not affiliated with Avanza Bank AB. The underlying API can be taken down or changed without warning at any point in time.

The author of this software is not responsible for any indirect damages (foreseeable or unforeseeable), such as, if necessary, loss or alteration of or fraudulent access to data, accidental transmission of viruses or of any other harmful element, loss of profits or opportunities, the cost of replacement goods and services or the attitude and behavior of a third party.

## Packages

- `avanza-ts`: reusable, terminal-agnostic Avanza SDK
- `avanza-cli`: terminal interface that depends on `avanza-ts`

The [documentation site](https://antewall.github.io/avanza-ts/) has separate guides for the [SDK](https://antewall.github.io/avanza-ts/docs/sdk/) and [CLI](https://antewall.github.io/avanza-ts/docs/cli/).

The dependency direction is strictly `avanza-cli` to `avanza-ts`.

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

Run `pnpm dev` to watch both TypeScript packages. Use `pnpm changeset` to describe a publishable change and `pnpm release` to build and publish packages with pending versions.

Run `pnpm --filter @avanza/docs dev` to work on the documentation locally. The docs build generates CLI topic pages from oclif help before exporting the static site. GitHub Pages deployment runs from `.github/workflows/docs.yml` (select **GitHub Actions** as the repository's Pages source).

The docs build also generates the [SDK API reference](https://antewall.github.io/avanza-ts/docs/sdk/reference/generated/) from the `avanza-ts` public entry point using TypeDoc. Run `pnpm --filter @avanza/docs generate:sdk` to refresh it locally.
