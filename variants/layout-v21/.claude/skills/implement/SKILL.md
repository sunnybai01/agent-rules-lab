---
name: implement
description: Implement the spec and plan of a story in docs/specs/AN-<n>/, step by step, test first. Also continues a story that another session started. Use after /story-start.
argument-hint: AN-<n>
---

# Implement a story

1. **Read** `docs/specs/AN-<n>/spec.md` and `plan.md`. If the plan has a "Handoff" section with content, start where it says. Run `git status` and `git log --oneline -5` to confirm the state. Do not redo a step marked `[x]`.
2. **Check the approval.**
   - `Gate: design`: `Approved-by` must name a person other than you, Status must be `Approved`, and each open question must have an answer in the spec. If not, stop and list what is missing.
   - `Gate: normal`: an open question without an answer: stop and ask the user. Otherwise, if Status is `Draft`, set it to `Approved` and write your name (`git config user.name`) and today's date in `Approved-by`.
3. **For each unchecked step:** write the test, see it fail, write the code, see it pass. Mark the step `[x]`. Commit.
4. **When the spec is wrong or contradicts itself.** The design that the approver signed is the public API, the contracts (events, ERP operations) and the schema in the design increment.
   - Design story, and the fix changes one of those three: stop and ask. The approver must see it.
   - Every other fix, in any story (an ordering rule, a helper, a test, a wrong detail in the spec): make the fix, write the difference and the reason under "Deviations", and continue. Where the spec contradicts itself, choose the reading that keeps the public API, contracts and schema.
5. **Update the module `AGENTS.md`** of each module you changed: public API, events, invariants, AC IDs.
6. **Review:** run `/review`. Fix each finding, or write under "Deviations" why not.
7. **Finish:** `pnpm check` passes, and `pnpm trace --require <AC IDs of the spec>` passes. Set the spec Status to `Done`. Empty the "Handoff" section.
8. **Report** the pull request title and body, filled from `.github/pull_request_template.md`. Do not push or open the pull request unless the user asks.
