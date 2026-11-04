# AN-903: Welcome-call task for each new person

- **Jira:** AN-903
- **Gate:** normal
- **Status:** Done
- **Approved-by:** Sunny Bai 2026-11-04
- **Baseline:** Discovery v0.1
- **Module:** journey. Touches: identity through its existing event `identity.person-registered` (subscribe only)

## Context

When a person registers, the advisor must call them. Journey creates a welcome-call task for each new person so the call shows in the person's task list. Serves A4-C-003 (the task list with its due date); it does not complete it (reason, step list, escalation and handover stay open).

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | `packages/core/src/journey/journey.test.ts`, `apps/worker/src/worker.test.ts` |

The story has no AC ID. Its expected behaviour: after `app.identity.registerPerson(...)` in the app that `createApp()` in `apps/worker` builds, `app.journey.listTasks(personId)` returns one task with kind `welcome-call`, title `Welcome call` and the business date of the registration as due date.

## Design increment

- **Module file (`journey/AGENTS.md`):**
  - Public API: `registerJourneySubscriptions(bus: EventBus, deps: { journey: Journey })`. Subscribes the journey handlers to the bus. The composition root calls it.
  - Events: `identity.person-registered`, direction Consumes, payload `personId`, `brand`. Creates the welcome-call task.
  - Invariants: one welcome-call task per person; the handler is idempotent (a second delivery of the event creates no second task).
  - Acceptance criteria: unchanged ("None yet"), as the story has no AC ID.
- **Module file (`identity/AGENTS.md`):** the event row lists journey as a reacting module, per the event conventions.
- **Composition root (`apps/worker/src/index.ts`):** `createApp()` calls `journey.registerJourneySubscriptions(bus, { journey: journeyApi })`.
- **Contracts:** none new. Journey subscribes to the existing `identity.person-registered` (type `PersonRegistered`, imported from `identity/index.ts`).
- **Schema:** none. The task goes into the existing `journey.task` table; no column changes.

## Local decisions

- The task values: kind `welcome-call`, title `Welcome call`, as the story states. Kept as constants in `journey/subscriptions.ts`.
- Due date is `businessDate(new Date(event.occurredAt))`, not the handler's clock: the business date of the registration stays right when the event is delivered late or retried.
- Idempotency: before it creates the task, the handler lists the person's tasks and skips when a `welcome-call` task exists. No schema change is needed for this.
- Journey imports only the type `PersonRegistered` from `identity/index.ts`. Identity does not import journey, so there is no cycle (event conventions).

## Out of scope

- Assigning the task to a named advisor; the task model has no assignee.
- Reason, step list, escalation and handover of a task (rest of A4-C-003, A4-AC-002).
- A database unique constraint on (person, kind) for concurrent deliveries in production.
- Different behaviour per `brand`.

## Open questions

None that change the design. For a person to do: add an AC ID to AN-903 in Jira if the welcome call must be traced; the tests then get that ID as title prefix.

## Deviations

- `registerJourneySubscriptions` takes its `deps` as the named, exported type `JourneySubscriptionDeps` (`{ journey: Journey }`), not an inline type. The shape is the same as the design; the named type follows the `<Module>Deps` pattern of the service and is listed in the module file.
- The events table in `journey/AGENTS.md` uses the direction `Consumes`, not `Reacts`: `pnpm docs` reads only `Emits` and `Consumes`.
