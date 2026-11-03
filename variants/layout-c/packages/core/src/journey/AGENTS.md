# Module `journey`

## Owns

Events, journeys, tasks, leads, messages, advisor e-mails. PostgreSQL schema `journey`.

## Public API (`index.ts`)

| Export | Use |
|---|---|
| `createJourney({ repo, bus, clock })` | Builds the module service |
| `.createTask({ personId, kind, title, dueDate? })` | Creates a task. `dueDate` defaults to today's business date |
| `.listTasks(personId)` | Lists the tasks of a person |
| `InMemoryTaskRepository` | Store for tests and the fixture |

## Tables (`schema.ts`)

| Table | Personal columns |
|---|---|
| `journey.task` | None. The task holds the person ID, not the person's data |

## Events

None yet. Journey reacts to events of other modules; register the handlers in `subscriptions.ts` ([conventions](../../../../docs/conventions/events.md)).

## Invariants

- A task never copies personal data from `identity`. It stores the `personId`.
