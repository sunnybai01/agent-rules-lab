# AN-900: Record a consent for a person

- **Jira:** AN-900
- **Gate:** design (trigger 2: new event `identity.consent-recorded`; trigger 3: new table `identity.consent`)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none (other modules learn about consents through the new event)

## Context

The platform records each consent decision of a person, for example for marketing e-mails, and head office must be able to prove each consent (T4 privacy controls). `identity` owns consents (architecture section 4, T3-D-009: one person record).

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| T3-AC-004 | `packages/core/src/identity/consent.test.ts` |

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API rows:
    - `.recordConsent({ personId, purpose, textVersion, channel, granted })` → `Promise<ConsentRecord>`. Appends a record. Publishes `identity.consent-recorded`. Throws `PersonNotFoundError` for an unknown person.
    - `.currentConsent(personId, purpose)` → `Promise<ConsentRecord | null>`: the latest record for the purpose.
    - `.consentHistory(personId)` → `Promise<ConsentRecord[]>`: all records of the person, oldest first.
    - `InMemoryConsentRepository`, `PersonNotFoundError`.
    - Types `ConsentRecord`, `ConsentChannel` (`"web" | "advisor" | "import"`), `RecordConsentInput`, `ConsentRepository`, `ConsentRecorded`.
    - `createIdentity({ repo, consents, bus, clock })`: new dependency `consents: ConsentRepository`.
  - Tables row: `identity.consent` with personal columns `person_id`, `purpose`, `granted`.
  - Events row: `identity.consent-recorded`, Emits, payload `consentId`, `personId`, `purpose`, `granted`.
  - Invariants: consent records are append-only; the repository has no update or delete (T3-AC-004). The current decision for a purpose is the latest record.
  - Acceptance criteria: T3-AC-003, T3-AC-004 (unchanged list).
- **Contracts:** new event, see [ADR-0017](../../adr/0017-consent-recorded-event.md).

  ```ts
  type ConsentRecorded = DomainEvent<
    "identity.consent-recorded",
    { consentId: string; personId: string; purpose: string; granted: boolean }
  >;
  ```

- **Schema:** new table `identity.consent` in `packages/core/src/identity/schema.ts`.

  | Column | Type | Data metadata |
  |---|---|---|
  | `id` | `uuid` PK (UUIDv7) | `notPersonal` |
  | `person_id` | `uuid` not null, index | personal, `identity`, "Link the consent to the person who gave it", owner `identity`, `account lifetime + 3 years` |
  | `purpose` | `text` not null | personal, `preference`, "Prove which consent the person decided on", owner `identity`, `account lifetime + 3 years` |
  | `text_version` | `text` not null | `notPersonal` |
  | `channel` | `text` not null (`web`, `advisor`, `import`) | `notPersonal` |
  | `granted` | `boolean` not null | personal, `preference`, "Prove the consent decision of the person", owner `identity`, `account lifetime + 3 years` |
  | `decided_at` | `timestamp with time zone` not null | `notPersonal` |

  No new personal data category: consent choices use the existing `preference` category. Retention follows the data conventions for consent records.

## Local decisions

- The register text names "type", "source", "date" and "withdrawal"; they map to `purpose`, `channel`, `decidedAt` and `granted: false`. This is a mapping, not a contradiction.
- `decidedAt` is the clock time when `recordConsent` runs; the API has no time input. Migration of old consents (which would need a past time) is out of scope.
- A withdrawal without an earlier grant is recorded as well: it is still a decision to prove.
- `consentHistory` orders by `decidedAt`, then by `id` (UUIDv7) for records with the same time.

## Out of scope

- The consent screens.
- The interface to the e-mail marketing tool.
- The migration of old consents.

## Open questions

1. **Purpose values.** The story does not list the purposes. Proposal: a free non-empty `text` (for example `marketing-email`), validated only as non-empty. Or must it be a closed list (an enum in the type and the column)? Which values?
2. **Event payload.** The event convention says the payload holds IDs, not copies of personal data. Other modules must learn about each change, and a subscriber that only gets `consentId` must call `identity` to read it. Proposal (ADR-0017): include `purpose` and `granted` in the payload, because a marketing subscriber cannot act without them and they are not identifying on their own. Confirm, or keep the payload to `consentId` and `personId`.
3. **Erasure.** Records are "never changed or deleted" (T3-AC-004), but personal data has a retention of `account lifetime + 3 years`. Does the later erasure job (not in this story) delete consent records after the retention, as an exception to the rule? This story adds no delete path.

## Deviations

Written during the implementation.
