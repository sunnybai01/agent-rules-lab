# AN-903: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Write ADR-0017 "Journey reacts to identity events" (Status `Proposed`), add it to the index, bump the next free number to 0018. The approver accepts it with the spec. (files: `docs/adr/0017-journey-reacts-to-identity-events.md`, `docs/adr/README.md`)
- [ ] 2. Test: `InMemoryTaskRepository.findByPersonAndKind` returns the task of that person and kind, or `null` → add the method to `TaskRepository` and the in-memory store. (files: `packages/core/src/journey/journey.test.ts`, `packages/core/src/journey/task.ts`)
- [ ] 3. Test: publishing `identity.person-registered` on an `InMemoryEventBus` after `registerJourneySubscriptions` creates one task `welcome-call` / `Welcome call` due on the Berlin business date of `occurredAt` (include a case near midnight UTC, e.g. `2026-11-04T23:30:00Z` → `2026-11-05`) → write `subscriptions.ts`, export `registerJourneySubscriptions` and `JourneySubscriptionDeps` from `index.ts`. (files: `packages/core/src/journey/journey.test.ts`, `packages/core/src/journey/subscriptions.ts`, `packages/core/src/journey/index.ts`)
- [ ] 4. Test: the same event delivered twice gives one welcome task. (files: `packages/core/src/journey/journey.test.ts`, `packages/core/src/journey/subscriptions.ts`)
- [ ] 5. Test: in `createApp()` with a fixed clock, after `app.identity.registerPerson(...)` (`@example.test` e-mail), `app.journey.listTasks(person.id)` shows the welcome task → call `registerJourneySubscriptions` in the worker. (files: `apps/worker/src/worker.test.ts`, `apps/worker/src/index.ts`)
- [ ] 6. Update `journey/AGENTS.md` (public API, events, invariants), `identity/AGENTS.md` (consumer of `identity.person-registered`), and the architecture table row for journey if the ADR says so. Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
