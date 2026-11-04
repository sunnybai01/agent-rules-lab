# AN-901: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [x] 1. Test: `getPerson` returns `dateOfBirth` when given and `null` when not → add `dateOfBirth` to `Person`, `RegisterPersonInput` and `registerPerson` (files: `identity/identity.test.ts`, `identity/person.ts`, `identity/service.ts`)
- [x] 2. Test: a date after today's Berlin business date is rejected, today is accepted (Berlin midnight edge), an invalid date is rejected → `InvalidDateOfBirthError` and the check (files: `identity/identity.test.ts`, `identity/service.ts`, `identity/index.ts`)
- [x] 3. Add the column `date_of_birth` with data metadata; `pnpm pii` passes (files: `identity/schema.ts`)
- [x] 4. Update the module `AGENTS.md` (public API, tables, invariant). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
