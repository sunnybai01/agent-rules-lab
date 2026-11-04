# AN-903: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [x] 1. Test: publishing `identity.person-registered` on a bus with the journey subscriptions creates one task (`welcome-call`, `Welcome call`, due on the business date of `occurredAt`, including a late-evening UTC instant that is the next day in Berlin) → add `registerJourneySubscriptions` in `journey/subscriptions.ts`, export it from `journey/index.ts` (files: `packages/core/src/journey/journey.test.ts`, `packages/core/src/journey/subscriptions.ts`, `packages/core/src/journey/index.ts`)
- [x] 2. Test: the same event delivered twice gives one welcome-call task → skip when the person has a `welcome-call` task (files: `packages/core/src/journey/journey.test.ts`, `packages/core/src/journey/subscriptions.ts`)
- [x] 3. Test: in `createApp()`, after `app.identity.registerPerson(...)`, `app.journey.listTasks(personId)` shows the welcome-call task → call `registerJourneySubscriptions` in the composition root (files: `apps/worker/src/worker.test.ts`, `apps/worker/src/index.ts`)
- [x] 4. Update `packages/core/src/journey/AGENTS.md` (public API, events, invariants) and the event row in `packages/core/src/identity/AGENTS.md`. Run `/review`, then `pnpm check`.

## Handoff
