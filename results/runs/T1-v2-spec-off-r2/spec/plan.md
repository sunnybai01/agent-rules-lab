# AN-901: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Test: `registerPerson` with `dateOfBirth: "1990-04-12"` → `getPerson` returns it; without it → `dateOfBirth: null` → add `dateOfBirth` to `Person` and `RegisterPersonInput`, store it in `registerPerson` (files: `identity/identity.test.ts`, `identity/person.ts`, `identity/service.ts`)
- [ ] 2. Test: a date after today (`fixedClock` 2027-01-05) is rejected; today is accepted; Berlin edge: clock `2027-01-04T23:30:00Z` (already 5 January in Berlin) accepts `2027-01-05` → add `InvalidDateOfBirthError`, check with `kernel.businessDate`, export it from `index.ts` (files: `identity/identity.test.ts`, `identity/service.ts`, `identity/index.ts`)
- [ ] 3. Test: `2001-02-30` and `01.02.2001` are rejected → validate `YYYY-MM-DD` and the calendar date (files: `identity/identity.test.ts`, `identity/service.ts`)
- [ ] 4. Add column `date_of_birth` with its data metadata to `identity.person`; `pnpm pii` passes (files: `identity/schema.ts`)
- [ ] 5. Update the module `AGENTS.md` (public API, table, invariant). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
