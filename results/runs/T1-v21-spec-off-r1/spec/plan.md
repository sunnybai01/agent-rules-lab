# AN-901: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Test: `registerPerson` with `dateOfBirth: "1990-05-17"` → `getPerson` returns it; without it → `null`. Code: `Person.dateOfBirth`, `RegisterPersonInput.dateOfBirth?`, store it in `registerPerson` (files: `identity.test.ts`, `person.ts`, `service.ts`)
- [ ] 2. Test: a date after the business date of the clock is rejected with `InvalidDateOfBirthError`; today is accepted. Code: `InvalidDateOfBirthError`, check against `businessDate(clock.now())`, export from `index.ts` (files: `identity.test.ts`, `service.ts`, `index.ts`)
- [ ] 3. Test: a malformed (`05.01.1990`) and an impossible (`2020-02-30`) date are rejected with `InvalidDateOfBirthError`. Code: ISO date validation (files: `identity.test.ts`, `service.ts`)
- [ ] 4. Schema: column `date_of_birth` with its data metadata; `pnpm pii` passes (files: `schema.ts`)
- [ ] 5. Update the module `AGENTS.md` (public API, table, invariant). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
