# Avanza TypeScript

A pnpm workspace containing an Avanza SDK and an oclif-based CLI.

## Packages

- `avanza-ts`: reusable, terminal-agnostic Avanza SDK
- `avanza-cli`: terminal interface that depends on `avanza-ts`

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
