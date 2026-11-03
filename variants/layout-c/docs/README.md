# Document map

Each fact has one source. Other documents link to it; they do not copy it.

| Layer | Document | Answers | Reader |
|---|---|---|---|
| Entry | [AGENTS.md](../AGENTS.md), [README.md](../README.md) | Commands, hard rules, where to look | Agents, people |
| System | [architecture.md](architecture.md) | Runtime units, modules, data, flows, CI checks | People, agents for design work |
| System | [infrastructure.md](infrastructure.md) | Environments, topology, cloud | People |
| System | [delivery-plan.md](delivery-plan.md) | Milestones, sprints, ways of working, Definition of done | People |
| System | [discovery-baseline.md](discovery-baseline.md) | Requirements with their Discovery IDs | People, agents to cite IDs |
| System | [technical-decisions.md](technical-decisions.md) | Open technical decisions TD-01 to TD-48 | People |
| Decisions | [adr/](adr/README.md) | Accepted decisions and why | People, agents |
| Conventions | [conventions/](conventions/) | How to write code that passes the rules | Agents, people |
| Module | `packages/core/src/<module>/AGENTS.md` | What the module owns, its public API, events, invariants | Agents |
| Work | `docs/specs/AN-<n>/` | Spec and plan of one story | Agents, reviewers |
| Process | [jira.md](jira.md) | Jira project, issue types, fields | Agents, people |

## Keep the documents current

- A pull request that changes a public API, an event or an invariant updates the module `AGENTS.md` in the same pull request.
- A pull request that changes a rule in a convention updates the convention and the CI check together.
- A generated document is not edited by hand.
