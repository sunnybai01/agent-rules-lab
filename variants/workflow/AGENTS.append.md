
## Story workflow

Each Jira story goes through these steps. A person approves at the gate.

1. **Spec.** Use the `story-to-spec` skill. It writes `docs/specs/<KEY>/spec.md` and `plan.md` from the story and the acceptance criteria. Then stop.
2. **Gate.** A person reads the spec and the plan, changes them if necessary, and approves.
3. **Implement.** Use the `implement-plan` skill. Do the steps of the plan in order, test first.
4. **Review.** Ask the `architecture-reviewer` subagent to review the change. Fix each finding or record in the plan why you did not.
5. **Finish.** `pnpm check` passes. The plan shows each step as done.
