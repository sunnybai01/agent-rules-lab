# AN-900: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 0. After approval of the spec: write ADR-0017 "Consent record and consent-changed event" (Proposed), add it to the index; write a change record if open question 1 asks for one (files: `docs/adr/0017-consent-record-and-event.md`, `docs/adr/README.md`)
- [ ] 1. Test `T3-AC-004: records person, purpose, text version, channel, decision and time` → `Consent`, `ConsentChannel`, `ConsentRepository`, `InMemoryConsentRepository`, `recordConsent` (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`)
- [ ] 2. Test `T3-AC-004: fails for an unknown person` → `PersonNotFoundError` (files: `identity/consent.test.ts`, `identity/service.ts`)
- [ ] 3. Test `T3-AC-004: a withdrawal adds a record and keeps the earlier one` → `currentConsent`, `consentHistory` oldest first; repository has no update or delete (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`)
- [ ] 4. Test `publishes identity.consent-changed` with the payload of the spec → `ConsentChanged` type and publish after insert (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`)
- [ ] 5. Table `identity.consent` with data metadata and index; `consents` dependency in `IdentityDeps`; update existing callers and fixtures of `createIdentity` (files: `identity/schema.ts`, `identity/service.ts`, `identity/identity.test.ts`, callers found by `grep createIdentity`)
- [ ] 6. Exports in `identity/index.ts`
- [ ] 7. Update `identity/AGENTS.md` (API, event, invariant). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
