# Agent rules lab

Experiments that choose the documentation architecture and the agent workflow for [provital-platform](../provital-platform). The plan, the questions and the metrics are in [PLAN.md](PLAN.md).

## Layout

| Path | Contents |
|---|---|
| [fixture/](fixture/) | Minimal provital-platform skeleton: `kernel`, `identity`, `journey`, `integration`, `erp-port`, `erp-fake`, `apps/worker`, with the CI checks of architecture section 9 (dependency-cruiser, personal data check, traceability). One planted bug (T5) |
| [variants/_shared](variants/_shared/) | provital-platform `README.md` and `docs/` at `30918bb`. In every run |
| [variants/layout-a](variants/layout-a/) | E1-A: the current `AGENTS.md` (baseline) |
| [variants/layout-b](variants/layout-b/) | E1-B: one large root `AGENTS.md`. **Generated** from layout C by `node harness/build-layout-b.mjs`; do not edit |
| [variants/layout-c](variants/layout-c/) | E1-C: short root `AGENTS.md`, `docs/README.md` map, `docs/conventions/`, ADR template, `AGENTS.md` + `CLAUDE.md` per module |
| [variants/layout-v2](variants/layout-v2/) | Tier A of [the v2 proposal](proposals/ai-dev-spec-v2.md): layout C plus the Discovery ID register, `tools/{ids,docs-check,pr-check}`, the stricter `pii-check`, spec and plan templates, skills `story-start`, `implement`, `review`, `handoff`, subagent `reviewer`, PR template, CI. Has its own story workflow: with `--workflow spec` the harness uses its skills, not `variants/workflow`. Its extra `pnpm ids` and `pnpm docs` results are recorded in `checks`, but not in `checks.all` |
| [variants/layout-v21](variants/layout-v21/) | v2.1: v2 with the revisions of [the proposal, part 5](proposals/ai-dev-spec-v2.md): stop only for a change to the public API, contracts or schema; subscribing to an existing event is not a design story; plain commands, no branches; no spec file for a normal story on a direct request (`pr-check` accepts a "Design increment" section instead). Experiment `V21` |
| [variants/workflow](variants/workflow/) | E2-B: spec and plan templates, skills `story-to-spec` and `implement-plan`, subagent `architecture-reviewer` |
| [variants/feedback](variants/feedback/) | E3-B: Stop hook that runs `pnpm check` and sends failures back (3 attempts) |
| [tasks/](tasks/) | T1–T6: `task.json` (prompt), `grader/` (hidden tests, copied in after the run), `rubric.md` |
| [harness/](harness/) | `run.mjs` (one run), `batch.mjs` (one experiment), `report.mjs` (summary), `experiments.json` (matrix) |
| [results/](results/) | `runs/<run-id>/` evidence per run, `summary.md` |

## Run

Prerequisites: Node 24, pnpm 10, Claude Code signed in. Install the fixture once: `cd fixture && pnpm install`.

```bash
node harness/run.mjs --task T3 --layout c --no-agent --repeat 0   # grade only, no agent: tests the harness
node harness/batch.mjs pilot                                       # T3 × layouts a, b, c, once
node harness/batch.mjs E1 --parallel 2                             # 24 runs
node harness/batch.mjs E2 --best c                                 # after E1: set the winning layout
node harness/batch.mjs E3 --best c
node harness/report.mjs --best c                                   # writes results/summary.md
node harness/run.mjs --task T6 --layout v2 --build-only            # build a workspace only, print its path: for work on a variant
```

Each run:

1. Builds a workspace in `$TMPDIR/agentic-lab/<run-id>` (outside the lab, so no lab file is found by CLAUDE.md discovery): fixture + shared docs + overlays, `pnpm install --offline`, git commit and tag `baseline`.
2. Runs `claude -p` with `--setting-sources project` and an empty MCP config, so user hooks, plugins and MCP servers do not load. Permissions: `scoped` (default: edits plus an allowlist of shell commands, see `SCOPED_TOOLS` in `run.mjs`) or `--permissions bypass` (only in a sandbox). Each task has a budget cap (`budgetUsd`).
3. Grades: `pnpm check` parts, traceability, hidden grader (hard and soft). Saves `result.json`, `env.json`, `check.log`, `diff.patch`, transcripts and an empty `review.md`.

A run with a `result.json` is skipped; use `--force` to run it again. `--gate manual` stops the E2 spec workflow at the gate so that a person can edit and approve the spec.

## Review

Open `results/runs/<run-id>/review.md`, replace each `[ ]` with `[0]`, `[1]` or `[2]`, and run `node harness/report.mjs`. Score blind: do not look at the layout in the run ID before scoring if you can avoid it.

## Change a variant

- Change layout C, then run `node harness/build-layout-b.mjs` so that B keeps the same facts.
- Do not put the answer to a task in a variant. The docs describe conventions, not the tasks.
- After a change to a variant, the old runs of that variant are not comparable. Delete them.
