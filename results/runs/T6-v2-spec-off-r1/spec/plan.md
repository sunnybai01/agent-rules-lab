# AN-900: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Write the ADR for the event `identity.consent-recorded` (files: `docs/adr/0017-consent-recorded-event.md`, `docs/adr/README.md`).
- [ ] 2. Test `T3-AC-004: records a consent with person, purpose, text version, channel, decision and time` → `ConsentRecord`, `ConsentChannel`, `ConsentRepository`, `InMemoryConsentRepository`, `ConsentRecorded` in `consent.ts`; `recordConsent` in `service.ts` (files: `identity/consent.test.ts`, `identity/consent.ts`, `identity/service.ts`).
- [ ] 3. Test `T3-AC-004: rejects a consent for an unknown person` → `PersonNotFoundError` (files: `identity/consent.test.ts`, `identity/service.ts`).
- [ ] 4. Test `T3-AC-004: a new decision adds a record and the earlier record stays unchanged` and `T3-AC-004: currentConsent returns the latest record per purpose, or null` → `currentConsent` (files: `identity/consent.test.ts`, `identity/service.ts`).
- [ ] 5. Test `T3-AC-004: consentHistory returns all records of the person, oldest first` → `consentHistory` (files: `identity/consent.test.ts`, `identity/service.ts`).
- [ ] 6. Test `T3-AC-004: publishes identity.consent-recorded with consentId and personId after the record is stored` (files: `identity/consent.test.ts`, `identity/service.ts`).
- [ ] 7. Add the `identity.consent` table with data metadata; `pnpm pii` passes (files: `identity/schema.ts`).
- [ ] 8. Export the new API from `identity/index.ts`; pass `consents` wherever `createIdentity` is built (composition root, fixture, existing tests).
- [ ] 9. Update `identity/AGENTS.md` (public API, table, event, invariant). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
