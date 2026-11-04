# AN-900: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Write ADR `docs/adr/0017-consent-recorded-event.md` for the event contract `identity.consent-recorded` (files: `docs/adr/0017-consent-recorded-event.md`, `docs/adr/README.md`).
- [ ] 2. Test `T3-AC-004: records a consent with person, purpose, text version, channel, decision and time` → add `ConsentRecord`, `ConsentChannel`, `ConsentRepository`, `InMemoryConsentRepository` (insert and reads only), `recordConsent`, `consents` in `IdentityDeps` (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`, `identity/index.ts`).
- [ ] 3. Test `T3-AC-004: fails for an unknown person` → `UnknownPersonError` (files: `identity/consent.test.ts`, `identity/service.ts`, `identity/index.ts`).
- [ ] 4. Test `T3-AC-004: a withdrawal adds a record and never changes the earlier one` and `T3-AC-004: currentConsent returns the latest record per purpose or null` → `currentConsent` (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`).
- [ ] 5. Test `T3-AC-004: consentHistory returns all records oldest first` → `consentHistory` (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`).
- [ ] 6. Test `T3-AC-004: publishes identity.consent-recorded after each decision` → `ConsentRecorded` event (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`, `identity/index.ts`).
- [ ] 7. Table `identity.consent` with data metadata (files: `identity/schema.ts`); `pnpm pii` passes. Update callers of `createIdentity` for the new `consents` dependency (fixture, `identity.test.ts`, `apps/worker`).
- [ ] 8. Update `packages/core/src/identity/AGENTS.md` (API, table, event, invariant). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
