# Agent rules lab: plan

This lab finds, with evidence, the documentation architecture and the agent development workflow for [provital-platform](../provital-platform). The lab is separate from the product repository. The variant that wins moves into provital-platform in one pull request, together with two ADRs.

Source snapshot: provital-platform `30918bb` (docs copied to [variants/_shared/docs](variants/_shared/docs)).

## 1. Questions

| ID | Question | Answered by |
|---|---|---|
| Q1 | How much context does an agent need, and where does it come from? One large root file, or a short root file plus one file per module? | E1 |
| Q2 | Where do the spec and the plan of a story live? | **Decided: in the repository**, `docs/specs/AN-<n>/spec.md` and `plan.md`. Jira links to them |
| Q3 | At which steps does a person approve? Spec, plan, or only the pull request? | E2 |
| Q4 | How do the documents stay current? CI checks, generation, or the Definition of Done? | E3 and the checks in the fixture |

Already decided in provital-platform: `AGENTS.md` is the agent file; `CLAUDE.md` contains `@AGENTS.md`.

## 2. Metrics

Each run writes `results/runs/<run-id>/result.json`.

| Metric | Source |
|---|---|
| Task success | `pnpm check` passes **and** the hidden grader of the task passes |
| Rule violations | Count of dependency-cruiser errors and personal data check errors after the run |
| Traceability | The AC IDs of the task appear in test names |
| Cost | `total_cost_usd`, input and output tokens, number of turns, wall time (from `claude -p` stream-json) |
| Human interventions | Number of gates that needed a person (E2) |
| Review quality | A person scores `review.md` with the rubric of the task (0–2 per item) |

## 3. Experiments

| Exp | Variable | A | B | C |
|---|---|---|---|---|
| E1 | Document layout | `layout-a`: current AGENTS.md + docs (baseline) | `layout-b`: one large root AGENTS.md | `layout-c`: short root AGENTS.md + AGENTS.md per module + docs map |
| E2 | Workflow | Direct prompt | `workflow`: spec → plan (gate) → implementation | — |
| E3 | Feedback loop | No hooks | `feedback`: Stop hook runs `pnpm check` and sends failures back | — |

E1 keeps the workflow direct and the hooks off. E2 and E3 use the layout that wins E1.

**Scale (decided: the smaller set).**

| Exp | Tasks | Variants | Repeats | Runs |
|---|---|---|---|---|
| E1 | T1, T2, T3, T6 | 3 | 2 | 24 |
| E2 | T6 | 2 | 2 | 4 |
| E3 | T6 | 2 | 2 | 4 |
| Spare | T4, T5 | best layout | 1 | 2 |

About 34 runs. A pilot (one task, three layouts, one repeat) comes first to prove the harness.

## 4. Benchmark tasks

Each task tests one real rule of provital-platform.

| ID | Task | Rule under test |
|---|---|---|
| T1 | Add a date of birth to the person | Personal data metadata on every column (ADR-0011, TD-09) |
| T2 | Read the advisor master data from the ERP | Only `integration` reaches the ERP, through the port (T3-D-005, T3-AC-001) |
| T3 | Create a welcome task in `journey` when a person registers | Cross-module reactions through events (architecture rule 4) |
| T4 | Write the ADR for personal data metadata | ADR quality, valid Discovery IDs |
| T5 | Fix the business-date bug | Locate a planted bug; Europe/Berlin calendar |
| T6 | Implement story "Record a consent for a person (T3-AC-004)" | AC traceability, full flow |

A task has `tasks/<id>/task.json` (prompt and settings), `tasks/<id>/grader/` (hidden tests, copied in only after the run) and `tasks/<id>/rubric.md`.

## 5. Harness

1. `harness/run.mjs` builds a run directory **outside** this lab (so that no lab file is found by CLAUDE.md discovery): fixture + `_shared` docs + the layout overlay + optional workflow and feedback overlays. It runs `git init` and `pnpm install --offline`.
2. It runs `claude -p` with the task prompt, `--output-format stream-json`, `--setting-sources project`, an empty MCP config and `--permission-mode bypassPermissions`. User hooks, plugins and MCP servers are not loaded, so all runs see the same environment.
3. It copies the hidden grader in and runs `pnpm check`, the grader tests and the task checks. It writes `result.json`, the transcript, the diff and an empty `review.md`.
4. `harness/report.mjs` builds `results/summary.md`.

## 6. Deliverables

1. **Documentation architecture**: the winning layout, as `docs/README.md` (document map), templates (ADR, module AGENTS.md, story spec and plan) and the docs checks.
2. **Agent workflow**: the steps from a Jira story to a merge, the gates, the shared `.claude/` configuration (permissions, hooks, skills, subagents).
3. **Evidence**: `results/summary.md` and the scored reviews.
4. Two ADRs for provital-platform: documentation architecture, agent workflow. Then an update of delivery plan section 9 (Definition of done).

## 7. Timeline

| Dates | Work |
|---|---|
| 3–4 Nov | Plan, fixture, variants, tasks, harness, pilot |
| 5–11 Nov | Run E1, then E2 and E3; score the reviews |
| 12–13 Nov | ADRs, pull request to provital-platform, walkthrough with Ryan and Teki |

## 8. Risks

- The fixture is small; results may not transfer. Mitigation: each task uses a real rule; Sprint 2 checks the result with real stories.
- Run-to-run variance is high with 2 repeats. Mitigation: report the spread, not only the mean; repeat only the close calls.
- The runs use the account of one person. Mitigation: `--max-budget-usd` per run.
