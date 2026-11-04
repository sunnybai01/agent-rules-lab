# AI-assisted development

How a story goes from a Discovery ID to a merged commit, so that every step has a record and every person's agent works from the same sources. Decisions: [ADR-0015](../adr/0015-ai-development-workflow.md) (workflow), [ADR-0016](../adr/0016-documentation-architecture.md) (documents). The agent instructions are in [AGENTS.md](../../AGENTS.md); this document gives the reasons and the parts for people.

## 1. Principles

1. **A rule that a machine can check is a check, not a sentence.** Prose is for the rules that no check covers.
2. **Each rule comes with a template, a command or a check.** A bare rule is not followed (lab E1: only the layouts with an ADR template produced ADRs).
3. **One fact, one place.** Jira and specs carry IDs, not copies of the text.
4. **Current state and history are separate.** Living documents are rewritten; records are added. History is in git.
5. **Project facts live in the repository.** What a session learns goes into a spec, a module file or a convention through a pull request, not into personal memory.
6. **Progress lives in `plan.md`**, not in a conversation. A new session continues from the spec and the plan.

## 2. Document classes

| Class | Changed how | Loaded by the agent | Examples |
|---|---|---|---|
| Living | Rewritten in place. No change log. Line limit | Root `AGENTS.md` always; a module `AGENTS.md` when the agent works in that folder | `AGENTS.md`, architecture, conventions, module files |
| Record | Added, never changed after approval | Only through a link or `pnpm ids` | Discovery register, ADRs, change records, approved specs |
| Verified | Written by people, compared with the code by `pnpm docs` | With the module file | The Public API and Events tables of a module file |
| Generated | Built by CI, not in the repository | No | The traceability matrix |

The full map is [docs/README.md](../README.md). The line limits are in [rules.json](../../tools/docs-check/rules.json).

**Load order.** Claude Code loads the root `CLAUDE.md` (which imports `AGENTS.md`) at the start, and the `CLAUDE.md` of a folder when it reads a file in that folder. Each `AGENTS.md` has a `CLAUDE.md` next to it; `pnpm docs` checks this. The skills then read the spec. Nothing tells the agent to read every document.

## 3. Requirement levels

| Level | What | Where |
|---|---|---|
| L1 Discovery item | One ID: AC, D, C, P, O or R, pinned to a package version | [requirements/](../requirements/), `pnpm ids show` |
| L2 Module | A bounded context. Owns its ACs | `packages/core/src/<module>/AGENTS.md`, section "Acceptance criteria" |
| L3 Epic and story | Epic = one week; story = one deliverable, with its AC IDs in the summary | Jira ([jira.md](../jira.md)) |
| L4 Spec | The contract of one story | `docs/specs/AN-<n>/spec.md` |
| L5 Steps and tests | Plan steps, then tests named by AC ID | `plan.md`, `*.test.ts` |

- An AC is owned by one module; `pnpm ids` fails on two owners. D, C and R items are often cross-cutting; they are cited in ADRs and specs, not owned.
- One story = one spec = one pull request. A story has one primary module; it touches another module only through an event or that module's public API.

## 4. Gates

| Story | Before the code | In the pull request |
|---|---|---|
| Design story ([triggers](../../AGENTS.md#design-stories)) | ADR or change record; a spec. A second person approves it (`Approved-by`) before the code, or before the merge on a direct request | Code review against the approved spec |
| Normal story | Story workflow: the author approves the spec. Direct request: no spec file | Spec, or the design increment in the pull request body, is reviewed with the code |
| Fix | None | A test named by the AC ID; `Covered:` in the body |
| Chore, docs | None | Title format only |

## 5. Trace

```
ids.v<version>.json (pinned commit) → module AGENTS.md → Jira AN-<n> → spec (Approved-by)
→ branch AN-<n>-* → pull request (Spec, Refs, Covered, Verification, Deviations)
→ squash commit = pull request title and body → it("<AC ID>: ...") → CI matrix
```

GitHub setting: squash merge uses the pull request title and description as the commit message. So each commit on `main` carries the Jira key, the spec, the AC IDs and the evidence.

| Question | Answer |
|---|---|
| Which code and tests implement T3-AC-004? | `pnpm ids impact T3-AC-004` |
| Which story and requirement is behind a commit? | `git show <sha>`: Refs, Spec, Covered. The spec names the baseline version |
| Which ACs have no test yet? | The CI job summary, or `pnpm trace` |
| Where does story AN-<n> stand? | Jira for the status; `docs/specs/AN-<n>/plan.md` for the steps |

## 6. Requirement changes

- **New package version** (for example v0.1 → v1.0): export the new register with `pnpm ids export`, write `docs/changes/BL-v<version>.md` from `pnpm ids diff`, then point `current.json` to it.
- **One change after the baseline:** a change record `CR-NNN` ([template](../changes/README.md)). The impact comes from `pnpm ids impact`, not from memory.
- IDs are never reused. A replaced ID gets `status: superseded` and `supersededBy` in the register.
- `pnpm ids` then fails on each open spec and each test that cites the old ID. The spec goes to `Stale` and is approved again.

## 7. Checks

| Check | Command | Protects |
|---|---|---|
| Module boundaries, ERP access | `pnpm arch` | Hard rules 1–3 |
| Personal data metadata, no placeholders | `pnpm pii` | Hard rule 4 |
| Discovery IDs exist, are current, have one owner | `pnpm ids` | Hard rule 6, change control |
| Line limits, no change log, links, module sections, verified tables | `pnpm docs` | Section 2 |
| AC coverage | `pnpm trace` | Definition of done |
| Pull request title, spec, approval, coverage, evidence | `pnpm prcheck` (CI) | Section 4 and 5 |

`pnpm check` runs all but `prcheck`. CI runs `pnpm check` and, on a pull request, `pnpm prcheck`.

## 8. Shared agent configuration

Committed in `.claude/`, so that every person's agent takes the same path:

- Skills: `/story-start`, `/implement`, `/review`, `/handoff`.
- Subagent `reviewer`: compares the diff with the spec, the module files and the rules; it has not seen the conversation.
- `settings.json`: permissions. `.claude/settings.local.json` is personal and not committed.

## 9. Open points

| Point | Decided by |
|---|---|
| Does a normal story need a spec before the code, or only in the pull request? | Lab E2 |
| A Stop hook that runs `pnpm check` before the agent finishes | Lab E3 |
| `/cr` skill, glossary, generated module tables | After Sprint 2 |
