# Agent instructions

Provital platform: a modular monolith in TypeScript. pnpm workspace. This file holds all agent guidance. The other documents are listed in the document map below.

## Commands

| Command | Does |
|---|---|
| `pnpm check` | Type check, lint, tests, architecture rules, personal data check. Run it before you finish. It must pass |
| `pnpm format` | Fix formatting and safe lint findings |
| `pnpm test` | Unit tests (vitest) |
| `pnpm arch` | Module boundary rules (dependency-cruiser) |
| `pnpm pii` | Personal data metadata check |
| `pnpm trace --require <AC IDs>` | Fail if a test does not name each AC ID |

## Hard rules

1. A module imports another module only through its `index.ts`.
2. Only `packages/core/src/integration` uses `@provital/erp-port`. Only `apps/worker` loads an ERP adapter.
3. A module reacts to another module through an event. It never calls the other module to write.
4. Every table column has data metadata. See [docs/conventions/data.md](#data-conventions).
5. Test titles start with the AC ID they cover, for example `it("T3-AC-004: ...")`.
6. Fake data only (`@example.test`). No secrets.
7. A change to a module boundary, a contract, the data model or the technology needs an ADR first ([docs/adr](docs/adr/README.md)).

## Before you change code

- Read the section of each module you change below. It lists the public API, the events and the invariants.
- Read the convention for the topic: [data](#data-conventions), [events](#event-conventions), [ERP access](#erp-access-conventions), [tests](#test-conventions).
- Cite Discovery IDs (for example `T3-D-005`) from [docs/discovery-baseline.md](docs/discovery-baseline.md). Do not invent IDs.

## When you finish

- `pnpm check` passes.
- The module section in this file shows the new public API, events and invariants.
- Commit messages use Conventional Commits.

## Document map <a id="document-map"></a>

Each fact has one source. Other documents link to it; they do not copy it.

| Layer | Document | Answers | Reader |
|---|---|---|---|
| Entry | [AGENTS.md](#agent-instructions), [README.md](README.md) | Commands, hard rules, where to look | Agents, people |
| System | [architecture.md](docs/architecture.md) | Runtime units, modules, data, flows, CI checks | People, agents for design work |
| System | [infrastructure.md](docs/infrastructure.md) | Environments, topology, cloud | People |
| System | [delivery-plan.md](docs/delivery-plan.md) | Milestones, sprints, ways of working, Definition of done | People |
| System | [discovery-baseline.md](docs/discovery-baseline.md) | Requirements with their Discovery IDs | People, agents to cite IDs |
| System | [technical-decisions.md](docs/technical-decisions.md) | Open technical decisions TD-01 to TD-48 | People |
| Decisions | [adr/](docs/adr/README.md) | Accepted decisions and why | People, agents |
| Conventions | [conventions/](#data-conventions) | How to write code that passes the rules | Agents, people |
| Module | Module sections in AGENTS.md | What the module owns, its public API, events, invariants | Agents |
| Work | `docs/specs/AN-<n>/` | Spec and plan of one story | Agents, reviewers |
| Process | [jira.md](#jira) | Jira project, issue types, fields | Agents, people |

### Keep the documents current

- A pull request that changes a public API, an event or an invariant updates the module section of AGENTS.md in the same pull request.
- A pull request that changes a rule in a convention updates the convention and the CI check together.
- A generated document is not edited by hand.

## Data conventions <a id="data-conventions"></a>

Source: [architecture.md section 5](docs/architecture.md), ADR-0011, TD-09.

### Tables

- Each module owns one PostgreSQL schema. Define tables in `packages/core/src/<module>/schema.ts` with Drizzle.
- A module never reads another module's tables. Use the other module's public API.
- **Every table is wrapped in `withDataMeta(table, meta)`** from `kernel`. `meta` has one entry per column.
- A column that is not personal data: `notPersonal`.
- A personal data column:

  ```ts
  phone: {
    personal: true,
    category: "contact",           // contact | identity | preference | financial | health | other
    purpose: "Contact about an order",            // why the platform keeps it
    owner: "identity",             // the module that owns it
    retention: "account lifetime + 3 years",          // how long the platform keeps it
  },
  ```

- Personal data is any value that identifies a person or is about a person: names, e-mail, phone, address, date of birth, bank details, IP address, consent choices.
- `pnpm pii` fails when a column has no metadata, when a personal column has an empty purpose, owner or retention, or when a column name shows personal data but the metadata says `personal: false`.
- Default retention for account data: `account lifetime + 3 years`. Consent records: `account lifetime + 3 years` (proof of consent).

### Values

- **Money** is an integer in minor units with a currency: `kernel.money(amountMinor)`. Never a float.
- **Time** is stored in UTC as an ISO string. A business date uses the `Europe/Berlin` calendar: `kernel.businessDate(instant)`.
- **IDs** are UUIDv7: `kernel.newId(now)`. ERP keys (customer number `K123456`, advisor number `B12345`) are separate columns.
- **Brand**: entities that a second brand would split have a `brand` column (T3-D-013).

## Event conventions <a id="event-conventions"></a>

Source: architecture.md section 4 rule 4, TD-08.

- A module reacts to another module through an event on the bus. It never calls the other module to write. This keeps modules independent and lets the reaction retry.
- **Name:** `<module>.<past-tense-kebab>`, for example `identity.person-registered`.
- **Type:** declare it in the emitting module with `DomainEvent<"<name>", Payload>` and export the type from the module `index.ts`. The payload holds IDs, not copies of personal data.
- **Publish** after the write succeeds: `await bus.publish(event)`.
- **Subscribe** in the reacting module. Put the handlers in `<module>/subscriptions.ts` and export `register<Module>Subscriptions(bus, deps)` from the module `index.ts`. The composition root (`apps/worker/src/index.ts`) calls it.
- The emitting module does not import the reacting module. `pnpm arch` fails on a cycle between modules.
- A handler is idempotent: the same event delivered twice gives the same result.
- List each event in the AGENTS.md section of the emitting module and of each reacting module.

## ERP access conventions <a id="erp-access-conventions"></a>

Source: T3-D-005 (fixed), T3-AC-001, ADR-0004, TD-15.

- **Only the `integration` module uses the ERP port** (`@provital/erp-port`). Other modules call the `integration` public API. `pnpm arch` fails otherwise.
- **Only `apps/worker` (and later `apps/integration-gateway`) loads an adapter** (`@provital/erp-fake`, later `erp-nav`, `erp-bc`). Tests of `integration` may use `erp-fake`.
- To add an ERP read:
  1. Add the payload contract as a Zod schema and the operation to `ErpPort` in `packages/erp-port/src/index.ts`.
  2. Implement it in `packages/erp-fake/src/index.ts` with synthetic seed data. Support `unavailable`.
  3. Add a function to the `Integration` interface in `packages/core/src/integration/index.ts`. Return an `ErpRead<T>`: the data plus `source`, `sourceVersion` and `readAt` (T2-D-009).
  4. The module that needs the data receives `Integration` as a dependency and calls it. Wire it in `apps/worker/src/index.ts`.
- ERP keys: customer number `K` + 6 digits, advisor number `B` + 5 digits.
- The ERP can be down. A read throws `ErpUnavailableError`; the caller decides the fallback (T2 section 5).

## Test conventions <a id="test-conventions"></a>

Source: delivery plan section 9 (Definition of done), TD-04.

- Write the test first. See it fail. Then write the code.
- Put the test next to the code: `<module>/<name>.test.ts`. vitest.
- **A test that covers an acceptance criterion starts its title with the AC ID**: `it("T3-AC-004: records the consent text version", ...)`. `pnpm trace` reports the coverage.
- Use the in-memory repositories, `InMemoryEventBus` and `fixedClock`. Use `createApp()` from `apps/worker` for a test across modules.
- Fake data only: `@example.test` addresses, invented names.
- Test the edge cases of time in the `Europe/Berlin` calendar (midnight, daylight saving time).

## Module `kernel` <a id="module-kernel"></a>

The shared base. It imports no other module.

### Owns

Money, time, IDs, the event bus, data metadata. Later: rule sets, settings, audit log, pilot switch, feature flags (architecture section 4).

### Public API (`index.ts`)

| Export | Use |
|---|---|
| `money(amountMinor)`, `add`, `applyRate` | Money in minor units. `applyRate` rounds half away from zero |
| `businessDate(instant)` | The `Europe/Berlin` date of an instant, `YYYY-MM-DD` |
| `Clock`, `systemClock`, `fixedClock(iso)` | Time source. Inject it; never call `new Date()` in a rule |
| `newId(now)` | UUIDv7 |
| `DomainEvent`, `EventBus`, `InMemoryEventBus` | Events between modules ([conventions](#event-conventions)) |
| `withDataMeta`, `notPersonal`, `ColumnMeta` | Data metadata for each column ([conventions](#data-conventions)) |

### Invariants

- Money is never a float.
- A business date uses the `Europe/Berlin` calendar, including daylight saving time (Discovery #102).

## Module `identity` <a id="module-identity"></a>

### Owns

The person record with roles (T3-D-009), credentials, sessions, consents, preferences, pets, consultations. PostgreSQL schema `identity`.

### Public API (`index.ts`)

| Export | Use |
|---|---|
| `createIdentity({ repo, bus, clock })` | Builds the module service |
| `.registerPerson({ email, givenName, familyName, brand? })` | Creates a person. Publishes `identity.person-registered` |
| `.getPerson(id)` | Reads a person or `null` |
| `InMemoryPersonRepository` | Store for tests and the fixture |
| `EmailAlreadyRegisteredError` | Thrown when the e-mail exists |

### Tables (`schema.ts`)

| Table | Personal columns |
|---|---|
| `identity.person` | `email`, `given_name`, `family_name` |

### Events

| Event | Direction | Payload |
|---|---|---|
| `identity.person-registered` | Emits | `personId`, `brand` |

### Invariants

- One person record per e-mail address. The e-mail is stored in lower case (T3-AC-003).
- At most one ERP customer number per person (T3-AC-003).
- ERP master data comes through the `integration` module, never from the ERP port.

### Acceptance criteria

T3-AC-003, T3-AC-004.

## Module `journey` <a id="module-journey"></a>

### Owns

Events, journeys, tasks, leads, messages, advisor e-mails. PostgreSQL schema `journey`.

### Public API (`index.ts`)

| Export | Use |
|---|---|
| `createJourney({ repo, bus, clock })` | Builds the module service |
| `.createTask({ personId, kind, title, dueDate? })` | Creates a task. `dueDate` defaults to today's business date |
| `.listTasks(personId)` | Lists the tasks of a person |
| `InMemoryTaskRepository` | Store for tests and the fixture |

### Tables (`schema.ts`)

| Table | Personal columns |
|---|---|
| `journey.task` | None. The task holds the person ID, not the person's data |

### Events

None yet. Journey reacts to events of other modules; register the handlers in `subscriptions.ts` ([conventions](#event-conventions)).

### Invariants

- A task never copies personal data from `identity`. It stores the `personId`.

## Module `integration` <a id="module-integration"></a>

The only module that reaches the ERP (T3-D-005, T3-AC-001). See [ERP conventions](#erp-access-conventions).

### Owns

The outbox, the read copies (`erp_copy`), reconciliation, the message log, the ERP port client.

### Public API (`index.ts`)

| Export | Use |
|---|---|
| `createIntegration({ erp, clock })` | Builds the module service. `erp` is an `ErpPort` adapter, injected by the worker |
| `Integration.readCustomer(customerNumber)` | Customer master data as `ErpRead<CustomerMasterData>` or `null` |
| `ErpRead<T>` | Data plus `source`, `sourceVersion`, `readAt` (T2-D-009) |

### Invariants

- Every read records its source, source version and read time.
- No other module imports `@provital/erp-port`.

## Package `erp-port` <a id="package-erp-port"></a>

The ERP port: operations and payload contracts (Zod). No I/O (ADR-0004, TD-15).

- Each operation has a Zod schema for its payload and a method on `ErpPort`.
- Only `packages/core/src/integration` imports this package. Adapters (`erp-fake`, later `erp-nav`, `erp-bc`) implement it.
- A contract change is visible in review. Do not remove or rename a field without an ADR.
- Keys: customer number `K` + 6 digits, advisor number `B` + 5 digits.

## Package `erp-fake` <a id="package-erp-fake"></a>

The fake ERP adapter with synthetic seed data, for development and tests.

- Implement each `ErpPort` operation. Return a copy of the seed data.
- Support `{ unavailable: true }`: every operation throws `ErpUnavailableError`.
- Seed data is invented. Use `@example.test` addresses.

## App `worker` <a id="app-worker"></a>

The composition root: jobs, schedules and the wiring of the modules. One of two runtime units that load an ERP adapter.

- `createApp({ clock?, erp? })` builds the bus, the adapter, and every module service, and returns them.
- Register each module's event subscriptions here: call `register<Module>Subscriptions(bus, deps)`.
- Tests across modules use `createApp()`.

## Jira <a id="jira"></a>

All development is tracked in Jira. The board is the only status source (delivery plan section 1).

| | |
|---|---|
| Site | `57blocks.atlassian.net` |
| Project | `AN` (Anifit), team-managed |
| Board | [1144](https://57blocks.atlassian.net/jira/software/projects/AN/boards/1144/backlog) |
| Issue types | Epic, Story, Task, Bug, Subtask |
| Access for agents | The `atlassian` MCP server in [.mcp.json](.mcp.json). Each person signs in with their own Atlassian account: run `/mcp`, select `atlassian`, then authorize in the browser |

#### Issue types

| Type | Use it for | Parent |
|---|---|---|
| Epic | One week of work, Monday to Friday. Name: `W<two-digit week> <short theme>`, for example `W01 Foundations` (AN-1). Set Start date and Due date to the Monday and the Friday | None |
| Story | One deliverable of the week. This includes technical work, for example CI, infrastructure or a plan | The Epic of the week |
| Task | Small work that is not a deliverable, for example a configuration change or a chore | The Epic of the week |
| Bug | A behavior that does not agree with the acceptance criterion or the design | The Epic of the week in which it is fixed |
| Subtask | One step of a Story, Task or Bug | Story, Task or Bug |

Work that is not done by Friday moves to the Epic of the next week.

#### Fields

- **Summary.** Short, in English, in the imperative. A Story that covers acceptance criteria puts their IDs at the end, for example `Pay an order with PayPal (A2-AC-014, A2-AC-015)`.
- **Parent.** Every Story, Task and Bug has the Epic of its week as parent.
- **Description.** Use the template below.
- **Labels.**
  - The release: `R0`, `R0.x`, `RC` or `R1`.
  - The module, for Stories, Tasks and Bugs in one module: `mod-identity`, `mod-commerce`, `mod-subscription`, `mod-commission`, `mod-journey`, `mod-content`, `mod-ai`, `mod-integration` or `mod-kernel` ([architecture section 4](docs/architecture.md)). Work across modules, such as CI or planning, has no module label.
  - The scope per module is tracked with the module label, not with the Epic. The project has no Fix Version or Component field at this time.
- **Story point estimate.** The team sets it in sprint planning. Do not set it unless asked.
- **Sprint, Assignee.** Do not set them unless asked.

#### Description template

```markdown
### Context
Why this work is necessary. One to three sentences.

### Scope
- What is included.
- What is not included.

### Acceptance criteria
- A2-AC-014: the text of the criterion, or a link to it.

### Sources
- Discovery item IDs, ADRs, design links.
```

A Story also lists its annex items and its inputs (definition of ready, delivery plan section 9). An Epic uses the sections Goal, Exit and Sources.

#### Rules for agents

- Read before you write. Search with JQL for an issue that already exists before you create a new one.
- Before you create, change or transition more than one issue, show the list to the user and get approval.
- Do not delete issues. Do not change the status of an issue that another person owns, unless the user asks.
- Write in English.
- Name the issue key in the branch name and in the pull request title, for example branch `AN-123-paypal-checkout` and title `feat: pay an order with PayPal (AN-123)`.
