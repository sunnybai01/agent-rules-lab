# AN-900: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Test `T3-AC-004: records a consent with person, purpose, text version, channel, decision and time` and `T3-AC-004: fails for an unknown person` → `ConsentRecord`, `ConsentChannel`, `ConsentRepository` (insert, listByPerson only), `InMemoryConsentRepository`, `PersonNotFoundError`, `recordConsent`; `createIdentity` gets `consents` (files: `identity/consent.ts`, `identity/service.ts`, `identity/consent.test.ts`, existing callers of `createIdentity`)
- [ ] 2. Test `T3-AC-004: a new decision adds a record and never changes the earlier one` and `T3-AC-004: consentHistory returns all records oldest first` → `consentHistory` (files: `identity/service.ts`, `identity/consent.test.ts`)
- [ ] 3. Test `T3-AC-004: currentConsent returns the latest record per purpose, or null` → `currentConsent` (files: `identity/service.ts`, `identity/consent.test.ts`)
- [ ] 4. Test `T3-AC-004: publishes identity.consent-recorded after each decision` → `ConsentRecorded` type and publish (files: `identity/consent.ts`, `identity/service.ts`, `identity/consent.test.ts`)
- [ ] 5. Table `identity.consent` with data metadata; `pnpm pii` passes (files: `identity/schema.ts`)
- [ ] 6. Exports in `identity/index.ts`; wire `InMemoryConsentRepository` where `InMemoryPersonRepository` is wired (fixture, `apps/*`)
- [ ] 7. Update the module `AGENTS.md` (API, table, event, invariant). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
