---
name: review
description: Review the change of the current story against its spec, the module files and the rules, with the reviewer subagent. Use before you finish a story or open a pull request.
---

# Review the change

1. Ask the `reviewer` subagent to review the change of the current branch. Give it the story key.
2. For each finding: fix it, or write under "Deviations" in the spec why you keep it.
3. Copy the reviewer's deviation list into the pull request body under "Deviations from spec".
