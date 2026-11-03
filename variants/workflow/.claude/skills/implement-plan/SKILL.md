---
name: implement-plan
description: Implement an approved docs/specs/<KEY>/plan.md step by step, test first. Use after a person has approved the spec and the plan.
---

# Implement the plan

1. Read `docs/specs/<KEY>/spec.md` and `plan.md`. If the spec status is not `Approved`, stop.
2. For each unchecked step: write the test, see it fail, write the code, see it pass. Mark the step `[x]`.
3. If the plan is wrong, change the plan first and write why under "Review notes".
4. Ask the `architecture-reviewer` subagent to review the change. Fix the findings.
5. Run `pnpm check`. It must pass.
