# AI-assisted development

How a Discovery ID goes from the register to a release. Every agent, in any harness, works from the same files and commands. Rulebook v3, accepted on 5 November 2026. The rules are in [AGENTS.md](../../AGENTS.md); this document gives the reasons.

## 1. Principles

1. **The documents are rules; the code is the state.** Agents write code directly, not documents first. Code within the rules lands. Code that needs another rule waits for the rule edit, in the same or an earlier pull request. An agent stops at every conflict.
2. **Documents never repeat the code.** A schema, a field list or a folder tree is read in the code.
3. **Jira is the shared memory, not the source of truth.** A status shows the progress of the work. The case runs set an Ending's status; git shows where a change is deployed.
4. **Only an Ending completes an ID**, with `[evidence]` per environment.
5. **A rule a machine can check is a check.** The tools and checks are scripts with no model call. Any agent and any harness can follow them.
6. **A pass on the fake ERP is not a pass on NAV.**

## 2. Where information lives and who sees it

| Information | Lives in | Read with | Written by |
|---|---|---|---|
| Requirement sources, meeting notes, open questions | Discovery repository, ADO. Not visible to development agents | — | Discovery team |
| The register: IDs and their text, pinned to a Discovery commit | `docs/requirements/ids.<version>.json` | `pnpm ids show` | Discovery team, as a pull request |
| Background, glossary, decisions, conventions, module boundaries | `docs/`, module `AGENTS.md` | `AGENTS.md` first, the rest as needed | Pull requests |

## 3. Repository documents and language

The [document map](../README.md) lists each document and its class. [Writing](../conventions/writing.md) sets the style (ASD-STE100) and the word limits. Agents load these files on every task, so short files cost less and get read.

English in code, documents and commits.
