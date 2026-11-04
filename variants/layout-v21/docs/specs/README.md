# Story specs

One folder per Jira story: `docs/specs/AN-<n>/` with `spec.md` and `plan.md`, from [_template](_template/). `/story-start` writes them.

- **spec.md** is the contract. Status `Draft` → `Approved` → `Done` (or `Stale` when a change record changes one of its IDs). After approval only the "Deviations" section changes.
- **plan.md** is the progress. The checkboxes say where the work stands. A new session reads the spec and the plan and continues.
- A design story ([triggers](../../AGENTS.md#design-stories)) has `Gate: design`. A second person writes `Approved-by:` with their GitHub login and the date before the code.
- A normal story has `Gate: normal`. The author sets `Approved-by` and the spec is reviewed with the code in one pull request. On a direct request a normal story has no spec file: its design increment is in the pull request body.
