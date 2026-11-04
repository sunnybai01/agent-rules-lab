# AN-903: Create a welcome-call task when a person registers

- **Jira:** AN-903
- **Gate:** normal
- **Status:** Draft
- **Approved-by:** —
- **Baseline:** Discovery v0.1
- **Module:** journey. Touches: identity through its existing event `identity.person-registered` (subscribe only); `apps/worker` composition root registers the subscription

## Context

When a person registers, the advisor must call them. Journey creates a welcome-call task for each new person, so the call shows in the person's task list. The story has no AC IDs; it serves A4-AC-001 in part (a trigger creates its task). It does not implement the journey engine (A4-O-001) or the task reason, step list and escalation of A4-AC-002.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | `packages/core/src/journey/subscriptions.test.ts`, `apps/worker/src/worker.test.ts` |

Story behaviour that the tests check (no AC ID, so the titles carry no ID):

1. After `identity.person-registered`, the person has one task: kind `welcome-call`, title `Welcome call`, `dueDate` = business date (Europe/Berlin) of the registration.
2. The same event delivered twice gives one task.
3. In `createApp()` from `apps/worker`: after `app.identity.registerPerson(...)`, `app.journey.listTasks(person.id)` shows the task.

## Design increment

- **Module file** (`packages/core/src/journey/AGENTS.md`):
  - Public API, new row: `registerJourneySubscriptions(bus, journey)` — subscribes journey to the events it reacts to. Signature: `registerJourneySubscriptions(bus: EventBus, journey: Journey): void`.
  - Events, new row: `identity.person-registered` | Reacts | creates the `welcome-call` task (`personId`; `brand` unused).
  - Invariants, new row: each registered person has exactly one `welcome-call` task, due on the business date of the registration. The handler is idempotent.
  - Acceptance criteria: still none.
- **Composition root** (`apps/worker/src/index.ts`): calls `journey.registerJourneySubscriptions(bus, journeyApi)` after the services are built.
- **Contracts:** none new. Journey subscribes to the existing `identity.person-registered` (`personId`, `brand`), imported as the type `PersonRegistered` from `../identity` (its `index.ts`).
- **Schema:** none. The task uses the existing `journey.task` columns.

## Local decisions

- The due date is `businessDate(new Date(event.occurredAt))`, not the handler's clock: the story says "the business date of the registration", and a retried event after midnight must keep the same date.
- Idempotency: the handler lists the person's tasks and skips when a `welcome-call` task exists. No new repository method or column; one welcome call per person is the rule.
- `createTask` gets the `dueDate` explicitly; its default (today) stays unchanged.
- Kind and title are constants in `subscriptions.ts` (`WELCOME_CALL_KIND = "welcome-call"`, title `"Welcome call"`), not configuration: the journey engine (A4-O-001) is a later story.

## Out of scope

- The journey engine, configurable triggers and timing (A4-O-001, A4-AC-001 in full).
- Task reason, step list, escalation and assignment to a specific advisor (A4-AC-002).
- A persistent (PostgreSQL) task repository and the outbox/pg-boss delivery.

## Open questions

None.

## Deviations

Written during the implementation.
