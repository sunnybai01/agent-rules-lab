# Agent instructions

Provital platform: a modular monolith in TypeScript. pnpm workspace. The document map is [docs/README.md](docs/README.md). The workflow and its reasons are in [docs/engineering/ai-development.md](docs/engineering/ai-development.md).

## Commands

| Command | Does |
|---|---|
| `pnpm check` | Type check, lint, tests, architecture, personal data, Discovery IDs, documentation. Run it before you finish. It must pass |
| `pnpm format` | Fix formatting and safe lint findings |
| `pnpm ids show <ID>` | The text, type and owner of a Discovery ID. Use it; do not read the register file |
| `pnpm ids impact <ID>` | Every spec, test, ADR and module file that cites the ID |
| `pnpm trace --require <AC IDs>` | Fail if no test title starts with each AC ID |
| `pnpm arch`, `pnpm pii`, `pnpm docs` | One part of `pnpm check` |

Run each command on its own: no `cd`, pipes, loops or `&&` chains, which need a person's permission. Do not create branches; commit only when a skill says so.

## Hard rules

1. A module imports another module only through its `index.ts`.
2. Only `packages/core/src/integration` uses `@provital/erp-port`. Only `apps/worker` loads an ERP adapter.
3. A module reacts to another module through an event. It never calls the other module to write.
4. Every table column has data metadata ([data conventions](docs/conventions/data.md)). No placeholder values.
5. Test titles start with the AC ID they cover, for example `it("T3-AC-004: ...")`.
6. Cite only Discovery IDs that `pnpm ids show` knows. Never invent an ID.
7. Fake data only (`@example.test`). No secrets. Project facts go into the repository, not into personal memory.

## Design stories

A story is a **design story** when it does one of these. Otherwise it is a normal story.

1. Adds a module, or changes a module boundary or the direction of a dependency between modules.
2. Adds or changes an event (its name or payload), an ERP port operation or an external payload contract. Subscribing to an existing event is not a change.
3. Adds a table, or adds a column with a new personal data category. (A new column that is not personal, or that uses an existing category, is normal.)
4. Adds a technology, an external dependency or an external service.
5. Contradicts the text of a Discovery ID: another rule, value or scope. Mapping the text onto names and fields is not a contradiction; write it under "Local decisions" in the spec.

A design story needs an ADR for 1, 2 and 4 ([docs/adr](docs/adr/README.md)) and a change record for 5 ([docs/changes](docs/changes/README.md)). A second person approves its spec: before the code in the story workflow, before the merge on a direct request.

## Story workflow

1. `/story-start AN-<n>`: writes `docs/specs/AN-<n>/spec.md` and `plan.md`, then stops.
2. Design story: a second person approves the spec. Normal story: you continue.
3. `/implement AN-<n>`: the plan step by step, test first. Progress is the checkboxes in `plan.md`, not your memory.
4. `/review`: the `reviewer` subagent compares the change with the spec and the rules.
5. `/handoff`: when you stop before the end. Commit, push, and write where you stopped.

**A direct request** (no `/story-start`, maybe no key or AC): do the work in one go; do not stop for a missing key or AC. A design story gets a spec (`docs/specs/AN-<n>/` or `docs/specs/draft-<name>/`, Status `Draft`). A normal story gets no spec file: write its design increment in the pull request body. Report what a person must still do: the Jira key, and for a design story the approval. A fix needs a test named with the AC ID it restores; a chore needs nothing more.

## Before you change code

- Read the spec of the story (it is the contract), the `AGENTS.md` of each module you change, and the conventions it links. Do not read every document.

## When you finish

- `pnpm check` passes.
- The module `AGENTS.md` shows the new public API, events, invariants and AC IDs. `pnpm docs` compares it with the code.
- The pull request uses [the template](.github/pull_request_template.md). Its title is `<type>: <summary> (AN-<n>)`.

Jira rules: [docs/jira.md](docs/jira.md).
