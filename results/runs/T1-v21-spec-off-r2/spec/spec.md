# AN-901: Add a date of birth to the person

- **Jira:** AN-901
- **Gate:** normal
- **Status:** Done
- **Approved-by:** Sunny Bai 2026-11-04
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none

## Context

The person record (T3-D-009) has no date of birth. Birthday journeys (A4-O-001 date triggers, A4-C-002) need it. The story has no AC IDs.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | `packages/core/src/identity/identity.test.ts` (titles without an AC ID) |

Story behaviour, tested in `identity.test.ts`:

- `registerPerson` accepts an optional `dateOfBirth` (`YYYY-MM-DD`) and stores it.
- `getPerson` returns `dateOfBirth`, or `null` when it was not given.
- A date of birth after today is rejected with `InvalidDateOfBirthError`.

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API: `.registerPerson({ email, givenName, familyName, brand?, dateOfBirth? })`. Throws `InvalidDateOfBirthError` when `dateOfBirth` is not a valid `YYYY-MM-DD` date or is after today.
  - Public API: new export `InvalidDateOfBirthError`.
  - `Person` gets `readonly dateOfBirth: string | null`.
  - Tables: `identity.person` personal columns add `date_of_birth`.
  - Invariants: add "A date of birth is a calendar date (`YYYY-MM-DD`) and is not after today in the `Europe/Berlin` calendar."
  - AC IDs: unchanged.
- **Contracts:** none. The `identity.person-registered` payload stays `personId`, `brand`.
- **Schema:** `identity.person.date_of_birth`, Drizzle `date("date_of_birth", { mode: "string" })`, nullable. Data metadata:

  ```ts
  dateOfBirth: {
    personal: true,
    category: "identity",
    purpose: "Birthday journeys and greetings",
    owner: "identity",
    retention: "account lifetime + 3 years",
  },
  ```

  Category `identity` already exists on this table, so this is not trigger 3.

## Local decisions

- "Future" means after today's business date in `Europe/Berlin` (`kernel.businessDate(clock.now())`), per the data conventions; today itself is accepted.
- A string that is not a real calendar date (`2001-02-30`, `01.02.2001`) is rejected with the same `InvalidDateOfBirthError`; storing it would break the date column.
- The date of birth is not added to the `identity.person-registered` payload; consumers read it with `getPerson`. This keeps the event contract unchanged.
- Stored as a plain date string, not a timestamp: a date of birth has no time zone.

## Out of scope

- Changing the date of birth after registration.
- A minimum age or a lower bound on the year.
- Birthday journeys themselves (A4-C-002).

## Open questions

## Deviations

- Added a test that the `identity.person-registered` payload is exactly `personId`, `brand` when a date of birth is given (review finding); the spec named no test for "Contracts: none".
