# ADR-0015: AI development workflow: spec per story, risk-based gate, shared skills

- **Status:** Proposed
- **Date:** 2026-11-04
- **Deciders:** <tech lead>, Ryan, Teki
- **Sources:** delivery plan section 9 (Definition of done), agent rules lab E1 (24 runs, 4 November 2026)

## Context

Three people build the platform with Claude Code. Each person's agent starts from a fresh session, so the agents differ only by what the repository gives them. The work must be traceable from a Discovery ID to a commit, the requirements will change (Discovery v0.1 to v1.0, then change control, DR section 8), and the team has 13 weeks to R0. The lab showed that the hard rules hold when they are checks or types (0 violations in 24 runs), and that a rule without a template is not followed.

## Options

1. **Direct prompt.** The story text goes to the agent; the pull request is the only review. Good: no overhead. Bad: no record of the design; a design mistake is found after the code.
2. **Spec and second-person approval for every feature story.** Good: every design is checked early. Bad: with three people, each story waits for a second person; most stories add a function inside one module.
3. **Spec for every story; second-person approval only for design stories** (five triggers: module boundary, contract, new table or personal data category, technology, a different reading of a Discovery ID). Shared skills and a reviewer subagent; checks in CI.

## Decision

We choose option 3. The spec gives each story a record and a contract for the agent; the gate costs a second person only where a mistake is expensive (DR section 8 calls these structural changes). The skills `/story-start`, `/implement`, `/review` and `/handoff` and the `reviewer` subagent are in `.claude/`, so that all agents take the same steps. The pull request carries the trace, because squash merge turns it into the commit.

## Consequences

- Each story has `docs/specs/AN-<n>/`. A new session continues from the spec and the plan.
- A design story waits for a second person before the code. The trigger list is short so that this stays rare.
- `pnpm prcheck` in CI enforces the pull request fields, the spec status and the approval by a second person. `Approved-by` is written by hand; the reviewer of the pull request confirms it.
- To check: lab E2 (spec workflow against direct prompt) may move normal stories to "spec in the pull request body". Sprint 2 retro: share of feature pull requests with a spec, number of design stories, check failures by cause.
