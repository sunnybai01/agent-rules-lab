# Agent instructions

Provital platform: a modular monolith in TypeScript. pnpm workspace. Read [docs/README.md](docs/README.md) for the document map.

## Commands

| Command | Does |
|---|---|
| `pnpm check` | Type check, lint, tests, architecture rules, personal data check. Run it before you finish. It must pass |
| `pnpm format` | Fix formatting and safe lint findings |
| `pnpm test` | Unit tests (vitest) |
| `pnpm arch` | Module boundary rules (dependency-cruiser) |
| `pnpm pii` | Personal data metadata check |
| `pnpm trace --require <AC IDs>` | Fail if a test does not name each AC ID |

## Hard rules

1. A module imports another module only through its `index.ts`.
2. Only `packages/core/src/integration` uses `@provital/erp-port`. Only `apps/worker` loads an ERP adapter.
3. A module reacts to another module through an event. It never calls the other module to write.
4. Every table column has data metadata. See [docs/conventions/data.md](docs/conventions/data.md).
5. Test titles start with the AC ID they cover, for example `it("T3-AC-004: ...")`.
6. Fake data only (`@example.test`). No secrets.
7. A change to a module boundary, a contract, the data model or the technology needs an ADR first ([docs/adr](docs/adr/README.md)).

## Before you change code

- Read the `AGENTS.md` of each module you change. It lists the public API, the events and the invariants.
- Read the convention for the topic: [data](docs/conventions/data.md), [events](docs/conventions/events.md), [ERP access](docs/conventions/erp.md), [tests](docs/conventions/testing.md).
- Cite Discovery IDs (for example `T3-D-005`) from [docs/discovery-baseline.md](docs/discovery-baseline.md). Do not invent IDs.

## When you finish

- `pnpm check` passes.
- The module `AGENTS.md` shows the new public API, events and invariants.
- Commit messages use Conventional Commits.

Jira rules: [docs/jira.md](docs/jira.md).
