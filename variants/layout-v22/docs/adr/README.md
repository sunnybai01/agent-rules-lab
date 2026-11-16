# Architecture decision records

An ADR records one decision: the context, the options, the decision and its consequences.

## When to write one

Only for a design change: a choice between good options that is hard to undo after R1. [AGENTS.md](../../AGENTS.md#design-changes) lists the four kinds. Everything else goes into the pull request: a table, an event, a library or framework inside the stack, a version, a refactor. A technology choice that binds later code updates the living document that owns it, such as [infrastructure.md](../infrastructure.md) or a [convention](../conventions/), without a date or an issue key.

## How to write one

1. Copy [0000-template.md](0000-template.md) to `NNNN-short-title.md`: the highest number in this folder plus one. Another ADR took it before your merge: take the next one. Do not use a number again.
2. A new decision gets a new ADR. Edit an ADR only to change its decision, not to list the items that follow it.
3. Fill every section. Cite Discovery IDs that `pnpm ids show` knows. At most 900 words ([writing](../conventions/writing.md)).
4. Put the ADR in the pull request of the code that needs it, as its first commit, or in a stacked pull request. Request the tech lead's review. The merge accepts it.

## In force

An ADR has no status. The pull request is the proposal; its merge accepts the ADR. Every ADR on `dev` is in force.

- **Change a decision:** edit the ADR in a pull request, with the same review.
- **End a decision:** delete the ADR in a pull request. Git keeps the text.
