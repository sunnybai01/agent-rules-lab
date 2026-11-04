# AN-900: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. ADR-0017 is Accepted and the spec is Approved before step 2 (files: `docs/adr/0017-consent-recorded-event.md`, `docs/adr/README.md`, this spec).
- [ ] 2. Test `T3-AC-004: records person, purpose, text version, channel, decision and time` and `T3-AC-004: fails for an unknown person` → `ConsentRecord`, `ConsentRepository`, `InMemoryConsentRepository`, `ConsentRecorded` type, `recordConsent`, `PersonNotFoundError`, `InvalidConsentError`; new `consents` dependency (files: `identity/consent.ts`, `identity/consent.test.ts`, `identity/service.ts`, `identity/index.ts`, `apps/worker/src/index.ts`).
- [ ] 3. Test `T3-AC-004: rejects a channel outside web, advisor, import` and empty purpose or text version → validation in `recordConsent` (files: `identity/consent.test.ts`, `identity/service.ts`).
- [ ] 4. Test `T3-AC-004: a withdrawal adds a record; earlier records stay unchanged` and `T3-AC-004: currentConsent returns the latest record per purpose, or null` and `T3-AC-004: consentHistory returns all records oldest first` → `currentConsent`, `consentHistory` (files: `identity/consent.test.ts`, `identity/service.ts`, `identity/consent.ts`).
- [ ] 5. Test `T3-AC-004: publishes identity.consent-recorded once per record` → publish after insert (files: `identity/consent.test.ts`, `identity/service.ts`).
- [ ] 6. Table `identity.consent` with data metadata and index → `pnpm pii` passes (files: `identity/schema.ts`).
- [ ] 7. Update `identity/AGENTS.md` (public API, tables, events, invariants). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
