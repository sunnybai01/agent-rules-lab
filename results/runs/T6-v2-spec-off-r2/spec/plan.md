# AN-900: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Test `T3-AC-004: records the person, purpose, text version, channel, decision and time` → `ConsentRecord`, `ConsentChannel`, `ConsentRepository`, `InMemoryConsentRepository`, `ConsentRecorded` in `consent.ts`; `recordConsent` in `service.ts`; `consents` in `IdentityDeps`; exports in `index.ts`; update the callers of `createIdentity` (files: `packages/core/src/identity/consent.ts`, `consent.test.ts`, `service.ts`, `index.ts`, `identity.test.ts`, `apps/worker/src/index.ts`)
- [ ] 2. Test `T3-AC-004: fails for an unknown person` and `T3-AC-004: rejects an empty purpose, an empty text version and an unknown channel` → `PersonNotFoundError` and input checks (files: `service.ts`, `index.ts`, `consent.test.ts`)
- [ ] 3. Test `T3-AC-004: a withdrawal adds a record and keeps the earlier one` and `T3-AC-004: returned records cannot be changed` → append-only store, frozen records (files: `consent.ts`, `consent.test.ts`)
- [ ] 4. Test `T3-AC-004: currentConsent returns the latest record for the purpose or null` and `T3-AC-004: consentHistory returns all records oldest first` → `currentConsent`, `consentHistory` (files: `service.ts`, `consent.test.ts`)
- [ ] 5. Test `T3-AC-004: publishes identity.consent-recorded with the consent and person IDs` → publish after the append (files: `service.ts`, `consent.test.ts`)
- [ ] 6. Table `identity.consent` with data metadata as in the spec; `pnpm pii` passes (files: `packages/core/src/identity/schema.ts`)
- [ ] 7. Update the module `AGENTS.md` (public API, table, event, invariants). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
