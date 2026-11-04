# Document map

Each fact has one source. Other documents link to it; they do not copy it. The rules of this map are in [ai-development.md](engineering/ai-development.md).

| Class | Document | Answers |
|---|---|---|
| Living | [AGENTS.md](../AGENTS.md), [README.md](../README.md) | Commands, hard rules, design stories, the workflow |
| Living | [architecture.md](architecture.md), [infrastructure.md](infrastructure.md) | Runtime units, modules, data, flows, environments |
| Living | [delivery-plan.md](delivery-plan.md), [jira.md](jira.md) | Milestones, ways of working, Jira |
| Living | [discovery-baseline.md](discovery-baseline.md) | Engineering digest of the Discovery package, pinned to a version |
| Living | [technical-decisions.md](technical-decisions.md) | Decisions that are still open (TD-nn). A decided TD moves to an ADR |
| Living | [conventions/](conventions/) | How to write code that passes the rules |
| Living | `packages/**/AGENTS.md`, `apps/**/AGENTS.md` | What a module owns: API, events, invariants, AC IDs. Read it before you change the module |
| Living | `docs/specs/AN-<n>/plan.md` while the story is open | The steps and where the work stands |
| Record | [requirements/](requirements/) | The Discovery ID register per version. Read it with `pnpm ids show` |
| Record | [adr/](adr/README.md) | Accepted decisions and why |
| Record | [changes/](changes/README.md) | Baseline upgrades and change requests |
| Record | [specs/](specs/README.md) | The approved spec of each story |
| Record | [proposal/](proposal/) | Proposals as they were sent |
| Verified | The `<!-- verified -->` sections of module files | `pnpm docs` compares them with the code |
| Generated | The traceability matrix | CI writes it to the job summary. It is not in the repository |

## Rules

- A living document is changed in place and has no change log. History is in git, the ADRs and the change records.
- A record is not changed after approval. A new record replaces it.
- A pull request that changes a public API, an event, an invariant or an owned AC updates the module `AGENTS.md` in the same pull request.
- Line limits: [tools/docs-check/rules.json](../tools/docs-check/rules.json).
