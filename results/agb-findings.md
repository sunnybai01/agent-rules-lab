# AGB findings

Experiment `AGB`: tasks T1, T2, T3, T6 × layout `agb` × direct prompt × 2 repeats, on `claude-opus-5-5`, 5 November 2026. Layout `agb` is layout A plus [57blocks/agb](https://github.com/57blocks/agb) at `90d5772`, installed into each workspace by AGB's own `scripts/install.sh` before the baseline commit ([variants/layout-agb](../variants/layout-agb/)). Numbers: [summary.md](summary.md). A first batch ran on `claude-fable-5-1` by mistake and is kept apart in [pilot/agb-fable51](pilot/agb-fable51/README.md).

## What the agent had

| Part of AGB | In the run |
|---|---|
| `.abrc.json`, `mode: brownfield` | Yes. Brownfield, because the fixture is an existing system (AGB manual section 4) |
| Language section in `AGENTS.md` | Yes, written by `agb init` |
| Git hooks: pre-commit gate (107 gates, 14 hard), post-commit, pre-push | Yes |
| `agb-skills` plugin: 10 `/agb-skills:*` commands, 3 skills, 72 knowledge packs, session-start hook | Yes, through `--plugin-dir`; `env.json` lists the commands |
| `ab-knowledge` MCP server (`recall`, `record`, …) | Yes, connected |
| `agb check`, `status`, `stack`, `list` | Allowed |
| `agb run` (its own orchestrated sessions) | Not allowed: it starts sessions outside the run budget and the harness |
| `.claude/settings.local.json` from `agb init` (allow all `Bash`) | Removed: every layout runs with the same scoped allowlist |

## Results, direct prompt, 8 runs each

| Layout | Success | Hidden hard | Hidden soft | Docs updated | Ran `pnpm check` or tests | Said the shell was blocked | Mean cost |
|---|---|---|---|---|---|---|---|
| A: old `AGENTS.md` | 7/8 | 100% | 81% | 0/8 | 5/8 | 5/8 | $0.55 |
| B: one large file | 8/8 | 100% | 100% | 8/8 | 6/8 | 2/8 | $0.64 |
| C: short root and module files | 8/8 | 100% | 100% | 8/8 | 6/8 | 3/8 | $0.71 |
| v2 | 8/8 | 100% | 100% | 8/8 | 8/8 | 3/8 | $1.36 |
| v2.1 | 8/8 | 100% | 100% | 8/8 | 8/8 | 0/8 | $1.00 |
| **agb** | **7/8** | 100% | 88% | 1/8 | **3/8** | **6/8** | $0.61 |

## Findings

1. **In a direct prompt, the agent used nothing of AGB.** In 16 runs (8 on Opus, 8 on Fable) there was no `agb` command, no call to `ab-knowledge`, no `/agb-skills:*` command and no commit, so the pre-commit gate never ran. AGB is a pipeline (`/agb-spec` → `/agb-arch` → `/agb-tasks` → `/agb-test-plan` → `/agb-code` with `agb run` → `/agb-delivery`); a story given as a plain prompt does not enter it. What remained is layout A plus about 1,400 tokens of context in the first turn (the plugin's command list, five MCP tools, the language section). The results match: AGB is close to A on success, cost and documentation.
2. **The one failure is the A failure mode.** In T6 r1 a `for` loop was denied, the agent concluded that "shell commands are blocked in this session", ran no check, and left a test that fails on its own timestamps. 6 of 8 AGB runs reported a blocked shell; v2.1, which tells the agent to run each command on its own, had none. AGB's installer allows the whole shell for `agb run`, so in AGB's own set-up this denial would not happen. With the shared allowlist it does, and AGB has no rule that teaches plain commands.
3. **The pre-commit gate would not have caught that failure.** Each run's diff was replayed in a fresh workspace and checked with `AB_TRIGGER=git agb check`: hard 0 in all 8, including T6 r1. At the git trigger the test suite (`test-suite[build]`) does not run; AGB runs it in CI and in `agb run`. All 6 partial findings per run are about the fixture's README (no Stack, Architecture or Getting it running section), not about the agent's change.
4. **The soft score is A's documents, not AGB's.** T3 missed "handlers go in `subscriptions.ts`" in both runs, like A; AGB adds no project conventions. Only 1 of 8 runs updated a module document.
5. **Cost follows the model, not the layout.** On Fable the same eight runs cost $2.02 on average; on Opus $0.61. The harness now pins the model (`defaults.model` in `harness/experiments.json`).

## What this test does not show

- **AGB's own workflow.** It is built to take a project from a PRD to delivery in hours, with domain sessions, gates at every task commit and its own stop rules. These tasks are single stories in an existing code base. A fair test of AGB gives it a change request and runs its stages, including `agb run`, with its own permissions, and grades the result with the same hidden tests. That needs its own experiment design and budget.
- **The gate as a grader.** The gate passes everything here because brownfield mode and the git trigger leave out the tests. In CI it would have caught T6 r1.

## For anifit-platform

AGB and the v2.1 rules solve different problems. v2.1 shapes how an agent works on one story in an existing repository: what to read, when to stop for a person, how to trace an acceptance criterion. AGB runs a project through stages with deterministic gates. Taken as they are, they overlap in the gate and the skills; installing AGB in anifit-platform as it is would add context and hooks that a story-level agent does not use. Parts that could be taken over one by one: the "no evidence, no done" rule for test results, explicit stop conditions in code, and "a check that did not run is reported as not run".
