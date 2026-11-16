# Agent instructions

Provital platform: a modular monolith in TypeScript ([map](docs/README.md), [reasons](docs/engineering/ai-development.md)).

**The documents are the rules; the code is the current state.** Write the code directly. Code that follows the rules lands. Code that needs another rule waits until the rule changes. Stop at every conflict.

Read only the issue, its links, and the `AGENTS.md` and conventions of the modules you change. Stay inside this repository.

## Procedures

| You are told | Procedure |
|---|---|
| "Work on AN-<n>." | [docs/agent/work.md](docs/agent/work.md) |

Without a key: do the work and report what a person must do.

## Commands

| Command | Does |
|---|---|
| `pnpm check` | All fast checks. Must pass before you finish |
| `pnpm ids show <ID>` | The text of a Discovery ID. Do not read the register file |

One command per call: no `cd`, pipes, loops or `&&`.

## Work discipline

- Commit each step with the key: `feat: record a consent (AN-900)`. Never commit to `main` or `dev`.
- Work that is not a feature can have no issue: branch `<type>-<short-name>`, no key ([jira](docs/jira.md#comments-and-links)).
- English everywhere, in ASD-STE100 ([writing](docs/conventions/writing.md)). New folders follow [layout](docs/conventions/layout.md).

## Hard rules

1. A module imports another module only through its `index.ts`.
2. Only `packages/core/src/integration` uses `@provital/erp-port`. Only `apps/worker` loads an ERP adapter; the integration tests of `integration` may load `@provital/erp-fake`.
3. `packages/core` does not import the web framework, the UI or an app. A module writes only its own tables. Calls go down, reactions go up as events (ADR-0023).
4. Wrap every personal data column in `withDataMeta()` with a real purpose, owner, retention and category (ADR-0011, [data](docs/conventions/data.md)).
5. Unit tests carry no IDs.
6. Cite only IDs that `pnpm ids show` knows. Only an Ending completes an ID.
7. Fake data only (`@example.test`). No secrets.

## Design changes

A design change is a choice between good options that is hard to undo after R1:

- a module, a runtime unit or the module order;
- a new kind of data store;
- an interface that an outside party builds to our design, such as the ERP export endpoint or a report feed;
- a new personal data category.

Write its ADR as the first commit of the pull request, or in a stacked pull request, and request the tech lead's review. The merge accepts it. Build on your proposal meanwhile. Code that a rule forbids: propose the rule edit the same way.

Not a design change: an ERP port operation that follows ADR-0006, a provider webhook or a route under an existing prefix. Also not: a table, a column with `withDataMeta()` and its retention, an event, a library, a tool or a version. Give the reason in the pull request.

A conflict with a Discovery ID: post `[question @discovery]` with the ID, the conflict, the options and the Default you build meanwhile.

## When you finish

`pnpm check` passes. The module `AGENTS.md` shows changed owners and invariants. Open the pull request from [the template](.github/pull_request_template.md).
