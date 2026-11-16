# Work an issue

Input: "Work on AN-<n>." Role: worker. You write code, tests and an ADR for a design change.

## 1. Read

1. `pnpm ids show <ID>` for each ID in "Requirements". The IDs are for lookup only; the Ending completes them.
2. The `AGENTS.md` of each module you change, and the convention it links.

## 2. Build

For each step: write the test, see it fail, write the code, see it pass, commit with the key. While you build:

- A [design change](../../AGENTS.md#design-changes), or code that a rule forbids: write the ADR or rule edit first in the same pull request, or a stacked one. Request the tech lead's review. Build on your proposal.
- A conflict with a Discovery ID: post `[question @discovery]` with the ID, the text, the options and the Default you build meanwhile.
- Update the `AGENTS.md` of each module you changed when what it owns or an invariant changes. Do not copy the code into it.

## 3. Finish

1. `pnpm check` passes.
2. Open the pull request from [the template](../../.github/pull_request_template.md). The title of the pull request that completes the issue ends with `(AN-<n>)`; an earlier step ends with `(part of AN-<n>)`. Work without an issue follows [jira.md](../jira.md#comments-and-links). The developer who runs you merges after the reviewer subagent says APPROVE and CI is green. An ADR or a rule file also needs the tech lead.
