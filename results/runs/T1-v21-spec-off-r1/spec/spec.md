# AN-901: Add a date of birth to the person

- **Jira:** AN-901
- **Gate:** normal
- **Status:** Draft
- **Approved-by:** not needed (normal story)
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none

## Context

A person can give a date of birth at registration, and the platform returns it with the person. It serves the customer birthday journeys of A4-C-002 and the date trigger of A4-O-001; the journeys themselves are not part of this story.

## Acceptance criteria

The story has no AC IDs: None.

| ID | Test |
|---|---|
| None | `packages/core/src/identity/identity.test.ts` (titles without an AC ID) |

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API: `.registerPerson({ email, givenName, familyName, brand?, dateOfBirth? })`; `dateOfBirth` is an ISO date `YYYY-MM-DD`. Throws `InvalidDateOfBirthError` when it is not a valid ISO date or lies in the future.
  - Public API: `.getPerson(id)` returns the person with `dateOfBirth: string | null`.
  - New export: `InvalidDateOfBirthError`.
  - Tables: `identity.person` personal columns add `date_of_birth`.
  - Invariant: a stored date of birth is a valid ISO date that is not after the business date (`Europe/Berlin`) of the registration.
  - AC IDs: unchanged.
- **Contracts:** none. `identity.person-registered` keeps its payload (`personId`, `brand`).
- **Schema:** `identity.person.date_of_birth`, Drizzle `date("date_of_birth", { mode: "string" })`, nullable.

  ```ts
  dateOfBirth: {
    personal: true,
    category: "identity",
    purpose: "Birthday journeys (A4-C-002)",
    owner: "identity",
    retention: "account lifetime + 3 years",
  },
  ```

- **Types:** `Person.dateOfBirth: string | null`; `RegisterPersonInput.dateOfBirth?: string`.

## Local decisions

- "In the future" is compared with `kernel.businessDate(clock.now())` (`Europe/Berlin`): data conventions say a business date uses that calendar. Today is allowed.
- A malformed or impossible date (`2020-02-30`, `05.01.1990`) is rejected with the same `InvalidDateOfBirthError`: "ISO date" in the story is the input contract, and storing an invalid value would break the column type.
- One error class for both cases, with a message that names the case: callers handle one error for one field.
- Category `identity` and the default retention `account lifetime + 3 years` from the data conventions; both exist already, so trigger 3 does not apply.
- `null`, not `undefined`, when not given: the story asks for `null`, and it matches `erpCustomerNumber`.
- No database migration file: the repository has no migrations directory; the Drizzle schema is the source.

## Out of scope

- Changing a date of birth after registration.
- A minimum age or a lower bound on the year.
- Birthday journeys (A4-C-002) and adding the date of birth to the `identity.person-registered` payload.

## Open questions

- Purpose of the column: the story does not say why the platform keeps the date of birth. The spec uses "Birthday journeys (A4-C-002)". The product owner confirms or names the real purpose before the merge.

## Deviations

None.
