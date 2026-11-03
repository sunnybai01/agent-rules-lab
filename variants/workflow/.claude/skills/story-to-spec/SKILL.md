---
name: story-to-spec
description: Turn a Jira story with acceptance criteria into docs/specs/<KEY>/spec.md and plan.md. Use at the start of every story, before any code.
---

# Story to spec

1. Read the story: key, summary, acceptance criteria (AC IDs), sources.
2. Read the documents for each module the story changes, and the conventions they link.
3. Copy `docs/specs/_template/` to `docs/specs/<KEY>/`.
4. Fill `spec.md`. One row per AC ID. Name the test for each AC. Give the public API signatures, events, tables and data metadata. Put each unclear point in "Open questions".
5. Fill `plan.md`. Small steps, test first, each step names its files. The last step updates the module documentation and runs `pnpm check`.
6. Do not write production code. Stop and report the open questions.
