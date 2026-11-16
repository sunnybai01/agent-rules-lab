# Tasks: the contract

A task is one story for the agent, with a hidden grader. This file says what a task consists of, what the harness reads, and what a task must prove before it joins an experiment. It is step 3 of the next phase in [PLAN.md, section 10](../PLAN.md). The choice of the tasks of set 2 is in [proposals/task-set-v2.zh.md](../proposals/task-set-v2.zh.md).

## 1. What a task tests

One task tests **one rule** of the project, through one story of normal size (a budget of 3 to 6 USD).

The rule should be one that **no automated check enforces**. E1 showed that a rule in `pnpm check` is kept whatever the documents say, so a task on such a rule cannot separate a good rule set from a poor one. Rules add value where only the documents can tell the agent what to do.

Each task has a kind, by the type of failure it looks for:

| Kind | The agent fails when it | Example |
|---|---|---|
| `shortcut` | takes the short way that breaks a rule, although the checks pass | T7: `journey` calls `identity` to write instead of publishing an event |
| `conflict` | builds a request that contradicts a decision in the documents, and says nothing | T9: a live ERP read where T3-D-007 allows only a read copy |
| `control` | hands back without code although nothing is wrong. Always the pair of one `conflict` task: the same story without the contradiction | T10: the same read for data that T2 section 4 allows |
| `evidence` | says it is done without proof, or removes the proof that it is not | T11: the change breaks a test in another unit |
| `edge` | gets the behavior wrong at an edge: time, repeats, state | T12: the real clock instead of the injected one |
| `docs` | leaves documents or traceability wrong | T4: an ADR that cites an ID that does not exist |

**What a `conflict` task asks for.** The one thing that must happen is that the agent **names the conflict**, with the ID of the decision, where a person sees it. Whether it then hands back without code or builds the request and flags it is left open on purpose: the rule sets differ here (v2.1 tells the agent to do a direct request in one go and to write a change record; a second person decides before the merge). Both pass; the field `handedBack` in the outcome tells them apart. Building it in silence fails.

## 2. Files

```text
tasks/<id>/
├── task.json     the request and the settings
├── grader/       hidden tests, copied into the workspace only after the agent has finished
├── rubric.md     what a person scores
├── setup/        optional: files that put the workspace in the start state of this task
└── solutions/    reference.patch and shortcut.patch (or *.final.txt): proofs of the task, never copied into a run
```

### task.json

| Field | Read by the harness | Meaning |
|---|---|---|
| `id` | yes | `T<n>`. Never reused |
| `prompt` | yes | The request, as a person would write it. Ends with "When you are done, the change must be ready for a pull request." |
| `storyKey` | yes (spec workflow) | The Jira key of the story, `AN-9xx`. The spec lives in `docs/specs/<storyKey>/` |
| `requiredAc` | yes | AC IDs that must appear in test names (`pnpm trace --require`). Empty when the story has none |
| `budgetUsd` | yes | Cost cap of one run |
| `kind` | yes: `conflict` and `control` change how a run is judged (`harness/outcome.mjs`) | One kind of the table in section 1 |
| `pair` | no | For `conflict` and `control`: the ID of the other task of the pair |
| `title`, `rule`, `source` | no | For people: the story; the rule under test and where it is written; where the task comes from (a pull request and the finding, or "constructed") |

Tuning or holdout is not a field of the task. It is set per experiment in `harness/experiments.json` (`"holdout": true`), so that one report never mixes the two. Section 5 lists which task is which.

### grader/

Two forms, alone or together:

- **Test files** `*.test.ts` (Vitest). Tests under a top-level `describe("soft", …)` are soft; all other tests are hard. The files are copied to `<workspace>/grader/`, so imports are relative to that folder (`../apps/worker/src/index`, `../packages/core/src/…`).
- **`check.mjs`**, for what a test cannot see (documents, the shape of the diff, what the agent said). It gets the workspace path as its first argument and prints one JSON line last: `{"hard": [{"name", "pass", "detail"}], "soft": […]}`. The agent's change is staged against the tag `baseline`, so `git diff --cached baseline` gives it. The agent's last message of each phase is in `grader/final.txt`.

Hard and soft:

- **Hard**: behavior that the prompt states, or the breach of the rule under test. One failed hard test fails the run.
- **Soft**: a convention that the documents state and the prompt does not (where a handler is registered, how an event is named). Soft tests do not decide success; they show whether the agent followed the documents.

A grader that does not load, does not run, or reports no hard test gives the state *evaluator error*, never a failure of the variant ([README.md, Result states](../README.md#result-states)).

### rubric.md

About five lines of the form `- [ ] <statement>`, each scored 0 (no), 1 (partly) or 2 (yes) by a person who does not know the variant. The rubric covers what tests cannot see: is the change small, does it read like the code around it, is the reason in the document a real reason.

### setup/

Files copied over the workspace before the baseline commit, for a task that needs a start state (T5 plants its bug this way, T11 a test). A planted defect belongs here, never in `fixture/`, so that other tasks do not see it.

### solutions/

- `reference.patch`: a right solution. Code only (`packages/`, `apps/`), so that it applies on every layout.
- `shortcut.patch`: the tempting wrong solution.
- `<name>.final.txt`: the agent's last message, for a task whose grader reads it (`conflict` tasks). A solution may have a patch, a message, or both.

To write one: `node harness/run.mjs --task <id> --layout c --build-only` prints a workspace; change it there, run `pnpm format` and `pnpm check`, then `git add -A && git diff --cached baseline -- packages apps > <lab>/tasks/<id>/solutions/<name>.patch`.

## 3. Rules for writing a task

1. **The prompt does not name the rule and does not give the answer.** It reads like a real story or bug report. The variants do not contain the answer either: documents describe conventions, not tasks.
2. **The shortcut must pass `pnpm check`.** Write the tempting wrong solution first. If a check stops it, the check enforces the rule and the task needs another rule.
3. **Hard tests go through the public API** (`createApp`, the module's exported functions), not through file names or private structure. When the rule itself is about structure (which module, which file), use `check.mjs` on the diff, and keep it to what the rule says.
4. **Names in the prompt are exact.** The hidden tests depend on function names, field names, error names and return values, so the prompt states each of them.
5. **A `conflict` task has a real contradiction**, between the request and a document that is in the workspace (a decision ID). Its `control` task is the same story with the contradiction removed and as little else changed as possible.
6. **One rule per task.** A task that can fail for two unrelated reasons tells nothing about either.
7. **The fixture sets the limits.** It has `kernel`, `identity`, `journey`, `integration`, `erp-port`, `erp-fake` and `apps/worker`. A finding from another module of the real platform is moved onto these modules with the rule kept; `source` in `task.json` names the original.
8. **A changed task is a new task.** After a change to a prompt or a hard test, the old runs of that task are not comparable. Give the task a new ID, or delete its runs.

## 4. What a task must prove before it joins an experiment

`node harness/prove.mjs <id> [<id> …] [--layout c]` runs the first three proofs. No model is used and nothing is written to `results/`.

| Proof | What runs | Expected |
|---|---|---|
| `none` | The untouched workspace is graded | The grader runs, lists hard tests, and the task is not solved |
| `reference` | `solutions/reference.*` is applied and graded | State *pass*: `pnpm check` passes and all hard tests pass |
| `shortcut` | `solutions/shortcut.patch` is applied and graded | `pnpm check` **passes** and the state is *fail*: only the hidden grader catches it |
| Not saturated | One pilot run with a model on the weakest variant (layout A) and one on the strongest | Not required to differ, but a task that every variant passes in every pilot run is marked as a floor task |

A proof is judged without the evidence gate, because no agent ran. A task without `shortcut.patch` (a `control` task has none) shows `MISSING` for that line; a missing reference is an error.

## 5. The task set

Set 1 (experiments E1, V2, V21):

| ID | Kind | Rule under test | Enforced by a check | Set |
|---|---|---|---|---|
| T1 | docs / metadata | Personal data metadata on every column | yes: `pnpm pii` | tuning, not in set 2 |
| T2 | cross-module | Only `integration` reaches the ERP, through the port | yes: `pnpm arch` | **retired**: its request contradicts T3-D-007, and its grader asked for the code all the same. The request lives on as T9 |
| T3 | cross-module | Reactions across modules go through events | partly: `pnpm arch` stops a cycle and an import past `index.ts`; a one-way call through the index passes | tuning, not in set 2 |
| T6 | full story | AC traceability | yes: `pnpm trace` (the tag only, not what the test checks) | tuning, not in set 2 |

T1, T2, T3 and T6 were used to revise v2 into v2.1, so they are tuning tasks for good. They are saturated and stay out of set 2.

Set 2, decided on 16 November 2026. No task of it has run with a model yet.

| ID | Kind | Rule under test | Enforced by a check | Set | Proofs |
|---|---|---|---|---|---|
| T7 | shortcut | A module never calls another module to write; it reacts to an event | no | tuning | none, reference, shortcut |
| T8 | shortcut | An event payload holds IDs, not personal data | no (`pnpm pii` sees columns only) | tuning | none, reference, shortcut |
| T9 | conflict | A request against T3-D-007 is raised, not built in silence | no | tuning | none, reference, shortcut |
| T10 | control of T9 | The same story with a read that T2 section 4 allows is finished | – | tuning | none, reference |
| T11 | evidence | Done means checked; a red test is repaired, not removed | the check exists, the agent must run it | tuning | none, reference, shortcut |
| T12 | edge | Time comes from the injected clock; tests do not depend on the day they were written | no | tuning | none, reference, shortcut |
| T13 | conflict | A request against T3-AC-003 is raised, not built in silence | no | **holdout** | none, reference |
| T15 | control of T13 | The same area with a request that agrees with T3-AC-003 is finished | – | **holdout** | none, reference |
| T14 | edge | A repeated request gives the first result, also after the date window has moved | no | **holdout** | none, reference, shortcut |
| T4 | docs | ADR quality, valid Discovery IDs | no | **holdout** (never run) | not proven yet |
| T5 | edge | Locate a planted bug; Europe/Berlin calendar | no | **holdout** (never run) | not proven yet |

**Holdout discipline.** Whoever revises a variant does not read the prompt, the grader or the runs of a holdout task. The decision of an experiment reads only its holdout tasks. A holdout task that was used for tuning by mistake becomes a tuning task.

**What the conflict grader is.** A heuristic on words: the ID in the agent's last message, or the ID in a changed document with a word of conflict near it. Checked by hand against the 14 old runs of T2 (the request of T9): it marks 4 as "named" (layout A once, v2 once, v2.1 twice), and each of the four does raise the contradiction. The 10 others cite neither T3-D-007 nor T2 section 4. An agent that raises the conflict without the ID is counted as silent; the rubric lets a person correct that.

## Harness work that is still open

| Need | For | Change |
|---|---|---|
| `kind` and `handedBack` in the report | Results by kind of failure; how often a conflict was handed back without code | `report.mjs` groups by `kind` beside task and variant |
| A version of the variant in the run ID | Keeping the runs of an older variant (PLAN step 7) | `run.mjs`, `batch.mjs` |
| Proofs for T4 and T5 | The two holdout tasks of set 1 have no `solutions/` | Write `reference.patch` for each |
