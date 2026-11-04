# AN-901: Add a date of birth to the person

- **Jira:** AN-901
- **Gate:** normal
- **Status:** Done
- **Approved-by:** Sunny Bai 2026-11-04
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none

## Context

The person record has no date of birth. Customer birthday journeys (A4-C-002, date trigger of A4-O-001) need one. The story has no AC IDs.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | `packages/core/src/identity/identity.test.ts` (titles without an AC ID) |

Story points that the tests cover:

1. `registerPerson` accepts an optional `dateOfBirth` (`YYYY-MM-DD`).
2. `getPerson` returns `dateOfBirth`, or `null` when it was not given.
3. A date of birth in the future is rejected with an error.

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API: `.registerPerson({ email, givenName, familyName, brand?, dateOfBirth? })`. Throws `InvalidDateOfBirthError` when `dateOfBirth` is not a valid `YYYY-MM-DD` date or is after today.
  - Public API: `.getPerson(id)` returns a `Person` with `dateOfBirth: string | null`.
  - New export: `InvalidDateOfBirthError`.
  - Tables: `identity.person` personal columns add `date_of_birth`.
  - Invariant: a stored date of birth is a valid calendar date, not after the `Europe/Berlin` business date of the registration.
- **Contracts:** none. `identity.person-registered` keeps its payload (`personId`, `brand`).
- **Schema:** `identity.person.date_of_birth`, Drizzle `date("date_of_birth", { mode: "string" })`, nullable.

  ```ts
  dateOfBirth: {
    personal: true,
    category: "identity",
    purpose: "Birthday journeys and greetings",
    owner: "identity",
    retention: "account lifetime + 3 years",
  },
  ```

## Local decisions

- Category `identity`: an existing category, used by the name columns of the same table.
- Purpose from A4-C-002 (customer birthday journeys); the story names none.
- Retention: the default for account data in the [data conventions](../../conventions/data.md).
- "Future" means after today's business date in `Europe/Berlin` (`kernel.businessDate(clock.now())`). Today is allowed.
- An input that is not a real calendar date (`2027-02-30`, `05.01.1990`) is rejected with the same `InvalidDateOfBirthError`: the story requires an ISO date.
- `Person.dateOfBirth` is `string | null` (ISO date), like the other date values stored as ISO strings.
- The date of birth is not added to the event payload: no consumer needs it, and personal data stays out of events.

## Out of scope

- Changing the date of birth after registration.
- A minimum age or a lower bound on the date.
- Birthday journeys themselves (journey module).
- A database migration file: the repository has no migrations yet; the Drizzle schema is the source.

## Open questions

None.

## Deviations

None.
