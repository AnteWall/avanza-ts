# Agent Instructions

## Changesets

Do not create or update Changesets unless the user explicitly requests one.

## API Tests and Fixtures

When writing or updating SDK API tests or recorded fixtures, load the `api-fixtures` skill from `.agents/skills/api-fixtures/SKILL.md` and follow its anonymization workflow before tracking any captured response.

## CLI Commands

Use separate commands for endpoints that return different kinds of data. Do not multiplex distinct responses behind `--view` flags; keep flags for filters and parameters of one command.
