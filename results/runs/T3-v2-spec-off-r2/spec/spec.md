# AN-903: Welcome task for each new person

- **Jira:** AN-903
- **Gate:** design (trigger 1)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** journey. Touches: identity through its existing event `identity.person-registered` (subscribe only); `apps/worker` registers the subscription

## Context

When a person registers, the advisor must call them. Journey creates a welcome task for each new person, so the call shows in the person's task list. Discovery items served: none found (no Discovery ID covers the welcome call).

## Acceptance criteria

None. The story has no AC IDs. The tests are named after the story behaviour until a person adds an AC ID (see Open questions).

| ID | Test |
|---|---|
| None | `packages/core/src/journey/journey.test.ts`, `apps/worker/src/worker.test.ts` |

## Design increment

- **Gate reason (trigger 1):** journey reacts to an identity event for the first time. This adds the dependency journey → identity (type import of `PersonRegistered` through `identity/index.ts`). Architecture section 4 lists journey's inputs as order, invoice and payment events only. ADR-0017 records the new direction. identity does not import journey, so there is no cycle.
- **Module file (`journey/AGENTS.md`):**
  - Public API, new row: `registerJourneySubscriptions(bus, { journey })` — subscribes journey's handlers to the bus. Called by `apps/worker`.
  - Public API, new type: `JourneySubscriptionDeps` (`{ journey: Journey }`).
  - `TaskRepository` gains `findByPersonAndKind(personId, kind): Promise<Task | null>`; `InMemoryTaskRepository` implements it.
  - Events: `identity.person-registered` | Consumes | `personId`, `brand` → creates the welcome task.
  - Invariants, new: "Each registered person has exactly one `welcome-call` task, due on the business date of the registration. Delivering the event twice creates no second task."
- **Module file (`identity/AGENTS.md`):** Events row for `identity.person-registered` names journey as a consumer. No change to the contract.
- **Worker (`apps/worker/AGENTS.md`, `src/index.ts`):** `createApp()` calls `journey.registerJourneySubscriptions(bus, { journey: journeyApi })`. Public API unchanged.
- **Handler:** on `identity.person-registered`:
  1. If `repo.findByPersonAndKind(personId, "welcome-call")` returns a task, do nothing.
  2. Otherwise create the task: `kind: "welcome-call"`, `title: "Welcome call"`, `dueDate: businessDate(new Date(event.occurredAt))`.
- **Contracts:** none new or changed. `identity.person-registered` (payload `personId`, `brand`) is used as it is.
- **Schema:** none. `journey.task` keeps its columns; the task stores `personId` only.

## Local decisions

- The due date comes from the event's `occurredAt`, not from the clock at handling time: with a real queue the handler can run after midnight, and the story says "the business date of the registration".
- Idempotency by a lookup on person and kind: one registration per person (one person per e-mail), so one welcome task per person is the rule.
- The handler creates the task through the journey service (`createTask`), so the task has the same shape as any other task. `findByPersonAndKind` is added on the repository, not on the public service API.
- The task is created for every brand; the story names no brand filter.

## Out of scope

- Assigning the task to a specific advisor (no advisor field on the task yet).
- A unique index on `(person_id, kind)` in PostgreSQL; there is no PostgreSQL repository yet.
- A `journey.task-created` event.

## Open questions

- **AC ID.** The story has no acceptance criterion. Should the PO add one in Jira and in the Discovery register so the tests carry it (hard rule 5)? Until then the test titles start with `AN-903:`.
- **ADR-0017 approval.** The new dependency journey → identity needs ADR-0017 (Proposed) accepted with this spec.

## Deviations

None.
