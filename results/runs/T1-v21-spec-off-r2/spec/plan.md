# AN-901: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [x] 1. Test: `registerPerson` with `dateOfBirth: "1990-05-17"` → `getPerson` returns it; without it → `null`. Code: `Person.dateOfBirth`, `RegisterPersonInput.dateOfBirth?`, set in `registerPerson` (files: `identity/identity.test.ts`, `identity/person.ts`, `identity/service.ts`)
- [x] 2. Test: a date of birth after today (`fixedClock`, including the Berlin midnight edge: 2026-11-04T23:30Z is already 2026-11-05 in Berlin) is rejected with `InvalidDateOfBirthError`; today is accepted; `2001-02-30` and `01.02.2001` are rejected. Code: `InvalidDateOfBirthError`, validation with `kernel.businessDate`, export from `index.ts` (files: `identity/identity.test.ts`, `identity/service.ts`, `identity/index.ts`)
- [x] 3. Column `date_of_birth` (Drizzle `date`, string mode, nullable) with the personal data metadata of the spec; `pnpm pii` passes (files: `identity/schema.ts`)
- [x] 4. Update the module `AGENTS.md` (public API, tables, invariant). Run `/review`, then `pnpm check`.

## Handoff
