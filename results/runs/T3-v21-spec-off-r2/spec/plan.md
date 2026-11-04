# AN-903: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Test: publishing `identity.person-registered` on an `InMemoryEventBus` with a `fixedClock` creates one `welcome-call` task titled `Welcome call`, due on the business date of `occurredAt` (include a case just after midnight Europe/Berlin, when the UTC date differs) → add `registerJourneySubscriptions(bus, journey)` (files: `packages/core/src/journey/subscriptions.test.ts`, `packages/core/src/journey/subscriptions.ts`)
- [ ] 2. Test: the same event delivered twice gives one task → skip when a `welcome-call` task exists (files: `packages/core/src/journey/subscriptions.test.ts`, `packages/core/src/journey/subscriptions.ts`)
- [ ] 3. Export `registerJourneySubscriptions` from the module (files: `packages/core/src/journey/index.ts`)
- [ ] 4. Test: in `createApp()`, after `app.identity.registerPerson(...)`, `app.journey.listTasks(person.id)` shows the welcome-call task → call `journey.registerJourneySubscriptions(bus, journeyApi)` in the composition root (files: `apps/worker/src/worker.test.ts`, `apps/worker/src/index.ts`)
- [ ] 5. Update the module `AGENTS.md` (public API, events, invariant). Run `/review`, then `pnpm check`. (files: `packages/core/src/journey/AGENTS.md`)

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
