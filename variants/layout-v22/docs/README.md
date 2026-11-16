# Document map

Each fact has one source. Other documents link to it; they do not copy it. The repository holds rules, background and code; the state of the work is in Jira ([ai-development.md](engineering/ai-development.md)).

| Class | Document | Answers |
|---|---|---|
| Living | [AGENTS.md](../AGENTS.md), [README.md](../README.md) | Procedures, commands, discipline, hard rules, design changes, how to start |
| Living | [agent/](agent/work.md) | The procedures: work an issue |
| Living | [architecture.md](architecture.md), [infrastructure.md](infrastructure.md) | Runtime units, modules, data, flows, environments |
| Living | [delivery-plan.md](delivery-plan.md) | Milestones, ways of working |
| Living | [discovery-baseline.md](discovery-baseline.md) | Engineering digest of the Discovery package, pinned to a version |
| Living | [conventions/](conventions/) | How to write code that passes the rules |
| Living | `packages/**/AGENTS.md`, `apps/**/AGENTS.md` | What a module owns, and rules the code cannot show. Read it before a change |
| Record | [requirements/](requirements/) | The Discovery ID register per version. Read it with `pnpm ids show` |
| Record | [adr/](adr/README.md) | Design changes |

## Rules

- A living document states only the rules in force. It has no change log, decision date, status or issue key as the source. Git holds the history, the pull request the reason, Jira the open work.
- A new register version replaces the old one. An ADR changes in a reviewed pull request ([adr](adr/README.md)).
- A pull request that changes what a module owns or one of its invariants updates the module `AGENTS.md` in the same pull request. It does not copy the code.
- Style and limits: [writing](conventions/writing.md).
