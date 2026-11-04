# AN-901: Add a date of birth to the person

- **Jira:** AN-901
- **Gate:** normal
- **Status:** Draft
- **Approved-by:** not needed (normal story)
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none

## Context

A person can give a date of birth when they register, and other code can read it back. Discovery items it serves: A4-O-001 and A4-C-002 (birthday journeys need the customer's birthday). The story has no AC IDs.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | `packages/core/src/identity/identity.test.ts` (titles name the AN-901 behaviour, not an AC ID) |

Story scope, as tests:

1. `registerPerson` accepts an optional `dateOfBirth` (`YYYY-MM-DD`) and stores it.
2. `getPerson` returns `dateOfBirth`, or `null` when it was not given.
3. A date of birth in the future is rejected with `InvalidDateOfBirthError`.
4. A value that is not a valid `YYYY-MM-DD` calendar date (for example `2001-02-30`, `01.02.2001`) is rejected with `InvalidDateOfBirthError`.

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API: `.registerPerson({ email, givenName, familyName, brand?, dateOfBirth? })`. Throws `InvalidDateOfBirthError` when `dateOfBirth` is not a valid `YYYY-MM-DD` date or is after today.
  - Public API: new export `InvalidDateOfBirthError`.
  - `Person` gets `readonly dateOfBirth: string | null` (`YYYY-MM-DD`).
  - Tables: `identity.person` personal columns add `date_of_birth`.
  - Invariants: add "A date of birth is a valid calendar date and not after today in the `Europe/Berlin` calendar."
  - AC IDs: unchanged.
- **Contracts:** none. `identity.person-registered` keeps its payload (`personId`, `brand`); the date of birth is not added to the event.
- **Schema:** `identity.person` gets column `date_of_birth`, Drizzle `date("date_of_birth", { mode: "string" })`, nullable. Data metadata:

  ```ts
  dateOfBirth: {
    personal: true,
    category: "identity",
    purpose: "Birthday journeys and greetings",
    owner: "identity",
    retention: "account lifetime + 3 years",
  },
  ```

## Gate

1. Module or boundary: no. The change stays in `identity`.
2. Event, ERP port or external payload contract: no. The event payload is unchanged.
3. Table, or column with a new personal data category: no. A new column in an existing table, category `identity`, which `given_name` and `family_name` already use.
4. Technology, dependency or service: no. Drizzle `date` is part of the existing dependency.
5. Contradicts a Discovery ID: no.

Gate: normal.

## Local decisions

- "Today" is the business date of `clock.now()` in the `Europe/Berlin` calendar (`kernel.businessDate`), as the data conventions require for business dates. Today itself is allowed.
- The value is stored and returned as the `YYYY-MM-DD` string, no time and no time zone: a date of birth is a calendar date, not an instant.
- An invalid format or an impossible date is rejected with the same `InvalidDateOfBirthError` as a future date: the story asks for an ISO date, and storing a malformed value would break the column.
- Purpose "Birthday journeys and greetings" (A4-O-001, A4-C-002); retention is the default for account data.
- `null` for "not given", like `erpCustomerNumber`.

## Out of scope

- Changing or deleting a date of birth after registration.
- A minimum age or any other lower bound.
- Adding the date of birth to `identity.person-registered` or to the ERP.
- The birthday journey itself.
- A database migration file: the module has no migrations yet; production storage reads the Drizzle schema.

## Open questions

None.

## Deviations

None.
