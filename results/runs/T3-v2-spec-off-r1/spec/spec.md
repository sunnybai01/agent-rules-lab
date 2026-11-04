# AN-903: Create a welcome-call task when a person registers

- **Jira:** AN-903
- **Gate:** normal
- **Status:** Done
- **Approved-by:** Sunny Bai 2026-11-04
- **Baseline:** Discovery v0.1
- **Module:** journey. Touches: identity through the existing event `identity.person-registered` (no change to identity); `apps/worker` registers the subscription

## Context

When a person registers, the advisor must call them. Journey creates a `welcome-call` task for each new person, due on the business date of the registration, so it appears in the person's task list. The story serves A4-C-003 (the task list) as a first fixed task; it has no AC ID of its own.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | The story has no AC ID. Behaviour is tested in `packages/core/src/journey/subscriptions.test.ts` and `apps/worker/src/worker.test.ts` |

Behaviour the tests check (from the story text):

1. After `app.identity.registerPerson(...)` in the app that `createApp()` builds, `app.journey.listTasks(personId)` returns one task with kind `welcome-call`, title `Welcome call` and `dueDate` = the business date (`Europe/Berlin`) of the registration.
2. The business date follows the Berlin calendar: a registration at `2026-11-04T23:30:00Z` is due `2026-11-05`.
3. The same event delivered twice gives one task (the handler is idempotent, [event conventions](../../conventions/events.md)).

## Design increment

- **Module file** (`packages/core/src/journey/AGENTS.md`):
  - Public API: add `registerJourneySubscriptions(bus: EventBus, deps: { journey: Journey }): void` — subscribes the journey handlers to the bus. Add the type `JourneySubscriptionDeps`.
  - Events: `identity.person-registered` | Consumes | `personId` → creates the welcome-call task.
  - Invariants: one `welcome-call` task per person; its due date is the business date of the registration (`occurredAt` of the event), not of the handling time.
  - Acceptance criteria: stays "None yet."
- **New file** `packages/core/src/journey/subscriptions.ts`: the handler. It imports the type `PersonRegistered` from `../identity` (the module `index.ts`, rule 1) and `businessDate` from `../kernel`. It calls only the journey service (`listTasks`, `createTask`); it never calls identity.
- **Worker** (`apps/worker/src/index.ts`): `createApp()` calls `journey.registerJourneySubscriptions(bus, { journey: journeyApi })` after it builds the journey service, as `apps/worker/AGENTS.md` prescribes. Public API of the worker does not change.
- **Contracts:** none new. Journey consumes `identity.person-registered` with its existing payload `{ personId, brand }`; the payload does not change.
- **Schema:** none. The task uses the existing `journey.task` columns (`kind`, `title`, `due_date`); no personal data is copied.

## Local decisions

- Due date from `event.occurredAt`, not from the clock at handling: in production the queue may deliver after midnight, and the story says "the business date of the registration".
- Idempotency by lookup: the handler skips when the person already has a `welcome-call` task. Enough for the in-memory store; a unique constraint is a later concern when the PostgreSQL repository exists.
- Kind and title are constants in `subscriptions.ts`, not settings: the story fixes them, and the journey engine (A4-C-001) will make tasks configurable later.
- Gate normal: trigger 1 — no new module; journey depending on the type of the emitting module's event through its `index.ts` is the pattern the [event conventions](../../conventions/events.md) prescribe, and identity does not import journey. Trigger 2 — the existing event is consumed unchanged. Trigger 3 — no table or column. Trigger 4 — no technology. Trigger 5 — no Discovery text is contradicted.

## Out of scope

- The reason, step list and escalation of a task (A4-AC-002).
- Assigning the task to a named advisor; the task holds the `personId` only.
- Configurable journeys (A4-C-001) and the PostgreSQL task repository.

## Open questions

None.

## Deviations

None.
