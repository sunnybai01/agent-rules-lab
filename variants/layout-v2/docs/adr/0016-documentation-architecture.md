# ADR-0016: Documentation architecture: living, record, verified, generated

- **Status:** Proposed
- **Date:** 2026-11-04
- **Deciders:** <tech lead>, Ryan, Teki
- **Sources:** T3-D-001 (modules), agent rules lab E1, [technical-decisions.md](../technical-decisions.md) section 2

## Context

Documents grow when the current state and its history are in one file, and agents then load more text for each task. Facts copied into several places drift apart. In the lab, one large root file (332 lines for 4 modules) and a short root file with one file per module gave the same results; the large file grows with each module and is a merge conflict for three people. The Discovery IDs are cited everywhere, but the full list is in another repository, so nothing checks that a cited ID exists (the Jira rules cited A2 IDs that are not in the package).

## Options

1. **One large `AGENTS.md`.** Good: one file to read. Bad: about 700 lines with 9 modules, loaded for every task; conflicts.
2. **Short root `AGENTS.md`, one `AGENTS.md` per module, conventions, records apart.** Four document classes with their own rules.
3. Option 2 plus documents generated from the code.

## Decision

We choose option 2, with the module tables checked against the code, and generation later where it pays. Classes: living (rewritten, no change log, line limits), record (added, not changed: the Discovery register, ADRs, change records, approved specs), verified (module Public API and Events tables, compared with `index.ts` and the event declarations), generated (the CI traceability matrix, not committed). The Discovery register `docs/requirements/ids.v<version>.json` is exported from the package at a pinned commit and is the anchor of the trace.

## Consequences

- `pnpm docs` and `pnpm ids` run in `pnpm check`. A module file that disagrees with the code, a broken link, a change log in a living document or an unknown ID fails CI.
- The change logs of architecture.md, delivery-plan.md and discovery-baseline.md move to git and change records. technical-decisions.md shrinks as decisions become ADRs.
- A new package version is a new register file and a `BL-` record; superseded IDs make open specs `Stale`.
- Harder: the register must be exported again for each package version (`pnpm ids export`).
