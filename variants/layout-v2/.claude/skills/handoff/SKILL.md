---
name: handoff
description: Stop work on a story so that another session or person can continue. Updates the plan, writes the Handoff section, commits and pushes. Use when you stop before the story is done.
argument-hint: AN-<n>
---

# Hand off a story

1. Mark each finished step `[x]` in `docs/specs/AN-<n>/plan.md`.
2. Replace the "Handoff" section of the plan with at most ten lines:
   - The last finished step.
   - The state of the next step: files changed, the test that fails and why.
   - Decisions made in this session that are not in the spec yet. Move a design decision into the spec ("Local decisions" or "Deviations"), not only into the handoff.
   - The next command, for example `/implement AN-<n>`.
3. Run `pnpm check` and write in the handoff which part fails, if any.
4. Commit everything: `chore: hand off AN-<n> at step <k> (AN-<n>)`. Push the branch if it has a remote.
5. Tell the user: a new session continues with `/implement AN-<n>`. It needs no part of this conversation.
