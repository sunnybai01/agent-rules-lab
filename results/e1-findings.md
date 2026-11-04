# E1 findings: document layout

24 runs on 4 Nov 2026: tasks T1, T2, T3, T6 × layouts A, B, C × 2 repeats. Model `claude-opus-5-5`, Claude Code 2.1.296, no hooks, direct prompt. Numbers: [summary.md](summary.md). Human review scores are not in yet.

| Layout | Success | Hidden hard | Hidden soft | Docs updated | Mean cost | Mean turns |
|---|---|---|---|---|---|---|
| A: current AGENTS.md | 7/8 | 100% | 81% | 0/8 | $0.55 | 31 |
| B: one large AGENTS.md | 8/8 | 100% | 100% | 8/8 | $0.64 | 28 |
| C: short root + module files | 8/8 | 100% | 100% | 8/8 | $0.71 | 39 |

## Findings

1. **The hard rules held in every layout.** No run broke a module boundary, the ERP rule or the personal data rule (0 violations in 24 runs). The code itself teaches these rules: `withDataMeta` is typed so that a missing column fails the type check, and the existing modules show the pattern. **Put a rule in a check or a type before you put it in prose.**
2. **The documents decide the soft conventions and the follow-through.**
   - A missed the convention "handlers go in `subscriptions.ts`" in both T3 runs; B and C followed it in all runs.
   - A never updated a document. B and C updated the module documentation in all 16 runs, with correct content (new API, events, invariants).
   - The one failure (T1-A-r2) is a formatting error: A's AGENTS.md does not list `pnpm check`, and the agent did not run it.
3. **An actionable rule is followed; a bare rule is not.** All three layouts state "a data model change needs an ADR first". Only B and C wrote ADRs (6 of 6 runs in T1, T2, T6), because they have an ADR template, an index and a "how to write an ADR" section. A wrote none.
4. **The ADR rule is too broad.** B and C wrote an ADR for a new column (date of birth) and for one new ERP read. With 2–3 people this gives one ADR per story. The numbers also disagree (one run used 0001, the others 0015). Narrow the trigger (new module, new boundary, contract break, new technology, new personal data category) and state the next free number.
5. **The personal data check accepts placeholders.** T1-A-r1 set the purpose to "TO BE CONFIRMED in the ADR …". The check passes because the field is not empty. Reject `TBD`, `TODO`, `to be confirmed`.
6. **B and C give the same results on every automatic measure.** B costs about 10% less and uses fewer turns; C reads more files (4.3 against 0.8 per run). The extra cost of B and C over A comes mostly from the extra work they do (ADRs, documentation), not from reading.
7. **The hidden hard tests are saturated.** All 24 runs pass them. To separate B from C, use the human review and harder tasks, not more repeats of these tasks.

## Choice of layout for E2 and E3

The evidence does not separate B from C. We use **C**, for reasons the fixture cannot show:

- The fixture has 4 modules, and B's single file is 332 lines. The real platform has 9 modules, so B would be about 700+ lines, loaded into every session, for every task.
- B puts all documentation updates in one file. With 2–3 people working in parallel, this file gets merge conflicts. C keeps each update next to its module.

Re-check this choice with the human review scores of B and C.

## Changes to make before the rules move to provital-platform

- Root `AGENTS.md`: list the commands, and "run `pnpm check` before you finish" (finding 2).
- ADR rule: a narrow trigger list, the next free number, a template (findings 3 and 4).
- `tools/pii-check`: reject placeholder values (finding 5).
