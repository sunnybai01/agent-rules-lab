# Agent rules lab: plan

This lab finds, with evidence, the documentation architecture and the agent development workflow for [provital-platform](../provital-platform). The lab is separate from the product repository. The variant that wins moves into provital-platform in one pull request, together with two ADRs.

Source snapshot: provital-platform `30918bb` (docs copied to [variants/_shared/docs](variants/_shared/docs)).

Sections 1 to 8 are the plan of 3 November 2026. The status on 16 November, the scope of the lab, the next phase and the removed AGB track are in sections 9 to 11.

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

## 9. Status and scope (16 November 2026)

**What the lab is for.** The lab chooses the agent rules for work on one story in an existing repository: what the agent reads, when it stops for a person, what evidence it gives before it says it is done. A task is one story. The goal is a variant that works in the real project. The tasks are a sample of that work, not the target.

**What the lab is not for.** The lab does not evaluate a system that runs a whole project from a PRD to delivery, such as AGB. Such a system differs from a rule variant in many things at once (models, permissions, orchestration, budget, form of the input), and its value shows on work larger than one story. See section 11.

**What has run.** 56 runs, in [results/summary.md](results/summary.md):

| Experiment | State |
|---|---|
| pilot, E1 (layouts A, B, C) | Done. Findings: [results/e1-findings.md](results/e1-findings.md) |
| E2 (workflow) | Replaced by V2 and V21: the v2 layouts bring their own spec workflow |
| V2, V21 | Done. v2.1 moved into provital-platform |
| E3 (feedback hook), spare tasks T4 and T5 | Not run |
| Human review (`review.md`) | Not scored in any run |
| AGB (direct prompt: 8 runs; workflow: never run) | Removed from the repository. See section 11 |

**How strong the results are.** Every result is *directional*, not firm ([README.md](README.md), Result states): there are no holdout tasks, each variant has 8 runs, and the 95% intervals overlap.

**Weak points of the task set.** The method holds; the tasks are the weak part.

1. The tasks test rules that `pnpm check` already enforces. On a direct prompt every variant passes 100% of the hidden hard tests, so the tasks cannot separate a good rule set from a poor one. Rules add value where no check can catch a mistake, and no task tests that.
2. There are no holdout tasks. v2.1 was revised from the runs of the same four tasks, so today the result means "fits these tasks".
3. There is one kind of task (a single story), one fixture, and 8 runs per variant. To tell 75% from 100%, a variant needs about 30 runs, for example 10 tasks × 3 repeats.

## 10. Next phase

In this order. Step 3 comes early because every later step depends on it.

| Step | Work |
|---|---|
| 1. Close this round | Merge the result states ([pull request 1](https://github.com/sunnybai01/agent-rules-lab/pull/1)). Record the choice of v2.1 as directional |
| 2. Decision rule before a run | Write the rule in this file before the next experiment runs: the gates, what is compared among the variants that pass, and the margin that counts as a difference. The change of the success definition on 16 November changed the ranking, so the rule must not be chosen after the results. Proposal, to confirm: the gate is the state `pass`; among the variants that pass, the higher success on the holdout tasks wins; cost per successful task decides when the success differs by less than the margin |
| 3. Task set v2 | 8 to 12 tasks, 3 repeats. Sources: findings of reviewers in provital-platform, above all rules that no check enforces (example: a business module calls the write command of another module). Kinds of task, by failure type: a shortcut that breaks a rule; a request with a contradiction, where the right move is to stop, paired with the same request without the contradiction, where the right move is to finish; a change across modules. Split the tasks into tuning tasks and holdout tasks (`"holdout": true` in `experiments.json`): a variant is revised only from tuning tasks, and the decision reads only the holdout tasks. T4 and T5 start as holdout tasks. Write the task contract down (`task.json`, hard and soft tests in `grader/`, `rubric.md`), so that a new task is cheap |
| 4. Model or rules | Run the same variants on two or three models (`--model`), and compare across both. This separates the effect of the model from the effect of the rules |
| 5. Evidence and stop rules as variants | One rule at a time, on top of v2.1, so that one variable changes: "no evidence, no done"; stop conditions written out; "a check that did not run is reported as not run"; a gate before the commit of each task. The ideas come from AGB (section 11); the variants are plain rule files, with no AGB code |
| 6. Loop with the real repository | The lab's result is a proposal. Collect from provital-platform: review rounds, rework, findings of reviewers. A finding that a rule should have prevented becomes a task (step 3) |
| 7. Regression suite | Run the tasks again when the model or `AGENTS.md` changes. Keep the runs of an older version of a variant and compare, instead of deleting them: that needs a version of the variant in the run ID (today the README says to delete them) |
| 8. Check the grader | The rubric is not scored and nobody has reviewed the soft tests. Compare two diffs of the same task blind, side by side, with a judge model that a person calibrates on a sample |
| 9. Second fixture | A scenario pack for another project, to show that the method carries over |

## 11. AGB and other system-level workflows: removed, for later

Decided on 16 November 2026: the lab stays on the story level, and everything of [57blocks/agb](https://github.com/57blocks/agb) leaves the repository. When the story line is mature, the lab can grow to system-level workflows.

**Why.**

- The lab's evidence comes from changing one variable. The AGB workflow changes many at once: the model mix, the permissions, sessions it starts itself, the budget, and the form of the input (a change request document). Whatever the result, the lab could not say which of these caused it.
- AGB is built to take a project from a PRD to delivery. A single story measures mostly the overhead of its pipeline, not its value.

**What was removed.** The layout `variants/layout-agb`, the workflow `harness/agb-flow.mjs` with its options in `harness/run.mjs`, the experiments `AGB`, `AGBF-pilot` and `AGBF`, the design `proposals/agb-workflow-test.zh.md`, the findings `results/agb-findings.md`, the 8 direct-prompt runs and the batch that ran on Fable by mistake. All of it is in the git history: commit `b061276` is the last one that has it.

**What the removed runs showed** (8 runs, direct prompt, AGB installed in the workspace). The agent used nothing of AGB: no `agb` command, no knowledge-base call, no slash command, no commit, so no gate ran. The results were close to layout A. This says that installing AGB does not change what an agent does with a story given as a plain prompt. It says nothing about AGB's own workflow, which never ran here.

**What goes on.** Single rules that AGB suggested, as plain variants on v2.1 (section 10, step 5).

**When the lab grows to system-level workflows**, the evaluation is designed together with the owner of the system:

- The owner confirms the fairness rules before any run, so that the result is accepted.
- The tasks have the size the system is built for: a small PRD with 3 to 5 stories across modules, with hidden graders. A story-level variant such as v2.1 works through the same PRD story by story.
- It compares system with system, each in its recommended set-up, with every difference listed: success by the same hidden tests, cost per successful task, answers a person had to give, wall time.
- It reuses the hidden graders and the result states (`harness/outcome.mjs`).
