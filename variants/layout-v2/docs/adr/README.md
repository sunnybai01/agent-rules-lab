# Architecture decision records

An ADR records one decision of a design story: a module or a boundary, a contract, or a technology ([triggers](../../AGENTS.md#design-stories)). A new table or a new personal data category is in the spec, not in an ADR, unless it also changes a boundary or a contract. Write the ADR before the code.

## How to write an ADR

1. Copy [0000-template.md](0000-template.md) to `NNNN-short-title.md`. **The next free number is 0017.** Then change this line.
2. Numbers 0001 to 0014 are reserved for the ADRs under review (technical-decisions.md section 4). Do not use them for a new ADR.
3. Fill every section. Cite Discovery IDs that `pnpm ids show` knows, and TD numbers. At most 80 lines.
4. Set the status to `Proposed`. A second person sets it to `Accepted`. After that, the ADR is not changed: a new ADR supersedes it.
5. Add a row to the index.

## Index

| ADR | Title | Status |
|---|---|---|
| 0002–0014 | Under review, not in this repository yet | — |
| [0015](0015-ai-development-workflow.md) | AI development workflow | Proposed |
| [0016](0016-documentation-architecture.md) | Documentation architecture | Proposed |
