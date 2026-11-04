# AN-903: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [x] 1. Test first: on `identity.person-registered` the journey handler creates one `welcome-call` task titled `Welcome call`, due on the Berlin business date of `occurredAt` (including `2026-11-04T23:30:00Z` → `2026-11-05`), and a second delivery of the same event creates no second task → add `registerJourneySubscriptions` (files: `packages/core/src/journey/subscriptions.test.ts`, `packages/core/src/journey/subscriptions.ts`, `packages/core/src/journey/index.ts`)
- [x] 2. Test first: in the app from `createApp()`, after `app.identity.registerPerson(...)`, `app.journey.listTasks(personId)` shows the welcome-call task → call `journey.registerJourneySubscriptions(bus, { journey: journeyApi })` in the composition root (files: `apps/worker/src/worker.test.ts`, `apps/worker/src/index.ts`)
- [x] 3. Update `packages/core/src/journey/AGENTS.md` (public API, event it consumes, invariants). Run `/review`, then `pnpm check`.

## Handoff
