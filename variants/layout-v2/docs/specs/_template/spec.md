# AN-<n>: <story summary>

- **Jira:** AN-<n>
- **Gate:** normal | design (trigger <1–5>)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v<version>
- **Module:** <primary module>. Touches: <other module and how (event, public API)>, or none

## Context

Why this story is necessary. One to three sentences.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| T3-AC-004 | `packages/core/src/identity/consent.test.ts` |

## Design increment

- **Module file:** the rows that change in `AGENTS.md` (public API with signatures, events, invariants, AC IDs).
- **Contracts:** events and ERP operations, with payload fields. Or none.
- **Schema:** tables and columns, with data metadata (personal or not, category, purpose, owner, retention). Or none.

## Local decisions

Small decisions inside this story that do not need an ADR, with one line of reason each.

## Out of scope

- ...

## Open questions

Empty before approval. Do not guess an answer that changes the design.

## Deviations

Written during the implementation: each difference from the approved design, and why. "None." if there is none.
