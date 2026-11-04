---
name: story-start
description: Start a Jira story. Writes docs/specs/AN-<n>/spec.md and plan.md from the story and its acceptance criteria, decides the gate, then stops. Use at the start of every story, before any code.
argument-hint: AN-<n>
---

# Start a story

Do not write production code in this skill.

1. **Get the story.** If its text is in the conversation, use it. Otherwise read it from Jira with the `atlassian` tools. You need the key, the summary, the scope and the AC IDs, if any. A story without AC IDs is allowed: write "None" in the acceptance criteria table, and name in the context the Discovery items it serves (`pnpm ids impact` and the module files help), or "none found".
2. **Check the IDs.** Run `pnpm ids show <ID> ...` for every Discovery ID of the story. An ID that is not in the register: stop and report it. A superseded ID: use its replacement and say so.
3. **Find the primary module.** `pnpm ids show` prints the owner of an AC. With no owner, choose the module whose "Owns" section covers it, and add the AC to that module file in the design increment. Another module is touched only through an event or its existing public API; otherwise propose to split the story.
4. **Read only what the story needs:** the `AGENTS.md` of each module you will change, and the conventions they link. Not every document.
5. **Decide the gate.** Go through the five triggers under "Design stories" in the root `AGENTS.md`, one by one. Write `Gate: design (trigger N)` or `Gate: normal`.
6. **Write the spec.** Copy `docs/specs/_template/` to `docs/specs/AN-<n>/`. One row per AC with the test file. The design increment is concrete: signatures, event names and payload fields, columns with their data metadata. Put each point that changes the design and that the story does not answer under "Open questions". Do not guess.
7. **Write the plan.** Small steps, test first, the files of each step. The last step updates the module `AGENTS.md`, runs `/review` and `pnpm check`.
8. **Stop and report:** the gate, the open questions, the two files.
   - Design story: "A second person approves the spec: they write `Approved-by:` and set Status to Approved."
   - Normal story: "Continue with `/implement AN-<n>`."
