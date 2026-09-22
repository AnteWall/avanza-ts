---
name: api-fixtures
description: Use when writing or updating avanza-ts SDK API tests or recorded HTTP fixtures. Capture responses with the avanza CLI and anonymize them before adding fixtures to the repository.
---

# API tests and fixtures

1. Prefer small inline responses with `jsonResponse()` for behavior tests. For recorded responses, use `avanza <command> --fixture --output <new temporary path>` after `pnpm build`. A stored session must already exist; never put credentials into source, shell history, or tests. `--fixture` is **raw**: `--json` redactions do not apply to it. Do not direct `--output` or `>` into a tracked fixture path.
2. Create the capture outside the repository, in a private temporary directory (e.g. `capture_dir=$(mktemp -d)` then `node packages/avanza-cli/bin/run.js auth session --fixture --output "$capture_dir/raw.json"`). The output path must not exist yet. Do not print raw captures in logs or paste them into issues. Delete the temporary directory when done, including on failure.
3. Before copying **any** data under `packages/avanza-ts/src/**/fixtures/`, anonymize both `request` and `response`: credentials, cookies, tokens, customer/account IDs, personal text, identifiers in paths or query strings, and any new sensitive fields. Preserve the JSON shape, useful non-sensitive numbers, states/enums, and values needed by the SDK parser. Use stable synthetic replacements with a valid format where parsing requires one; do not replace all strings blindly. Keep the `request` / `response` shape in `packages/avanza-ts/src/test-utils/http.ts`.
4. Inspect the anonymized file and `git diff` for private data **before** staging or committing. The raw capture must stay outside the repository. If uncertain whether a field is private, anonymize it or do not add the fixture.
5. Write `src/**/*.test.ts` tests using an injected mocked `fetch` and `baseUrl: 'https://example.test'`; never call the live API in tests. Reuse `loadHttpFixture()` / `httpFixtureResponse()` and assert both the parsed result and the outgoing method/path/body when relevant. The fixture response helper does not assert the fixture's request metadata for you.
6. Run the focused test and `pnpm check`. Do not create or update a Changeset unless explicitly requested.
