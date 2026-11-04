# AN-900: Record a consent for a person

- **Jira:** AN-900
- **Gate:** design (triggers 2 and 3)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery register @ 733e97e
- **Module:** identity. Touches: none directly; other modules learn about each consent change through the new event `identity.consent-recorded`

## Context

The platform records the consents of a person, for example for marketing e-mails. Head office must prove each consent (T4 privacy controls), so each decision is kept as an append-only record. `identity` owns consents (architecture section 4, T3-D-009).

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| T3-AC-004 | `packages/core/src/identity/consent.test.ts` |

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API rows:
    - `.recordConsent({ personId, purpose, textVersion, channel, granted })` → `Promise<ConsentRecord>`. Appends a record. Publishes `identity.consent-recorded`. Throws `UnknownPersonError` when the person does not exist.
    - `.currentConsent(personId, purpose)` → `Promise<ConsentRecord | null>`. The latest record for the purpose.
    - `.consentHistory(personId)` → `Promise<ConsentRecord[]>`. All records of the person, oldest first.
    - `InMemoryConsentRepository`, `UnknownPersonError`.
    - Types `ConsentRecord`, `ConsentChannel` (`"web" | "advisor" | "import"`), `ConsentRepository`, `RecordConsentInput`, `ConsentRecorded`.
  - `IdentityDeps` gets `consents: ConsentRepository`.
  - Table row: `identity.consent`, personal columns `purpose`, `text_version`, `channel`, `granted`, `decided_at`.
  - Event row: `identity.consent-recorded`, Emits, `consentId`, `personId`, `purpose`, `granted`.
  - Invariants: a consent record is never changed or deleted; a new decision (including a withdrawal) adds a record (T3-AC-004). The repository has `insert` and reads only, no update or delete.
- **Contracts:** new event `identity.consent-recorded`:

  ```ts
  type ConsentRecorded = DomainEvent<
    "identity.consent-recorded",
    { consentId: string; personId: string; purpose: string; granted: boolean }
  >;
  ```

  Published after the record is stored. `purpose` and `granted` are in the payload so that a subscriber (for example a future marketing sync) can react without a read back; they are a consent choice, but no contact or identity data. ADR needed (trigger 2): `docs/adr/0017-consent-recorded-event.md`.
- **Schema:** new table `identity.consent`, wrapped in `withDataMeta`:

  | Column | Type | Metadata |
  |---|---|---|
  | `id` | `uuid` PK (UUIDv7) | `notPersonal` |
  | `person_id` | `uuid` not null, references `identity.person.id` | `notPersonal` (key, same as `person.id`) |
  | `purpose` | `text` not null | personal, `preference`, "Prove the consent of the person (T4 privacy controls)", owner `identity`, `account lifetime + 3 years` |
  | `text_version` | `text` not null | same as `purpose` |
  | `channel` | `text` not null, `web` \| `advisor` \| `import` | same as `purpose` |
  | `granted` | `boolean` not null | same as `purpose` |
  | `decided_at` | `timestamptz` not null | same as `purpose` |

  Index on (`person_id`, `decided_at`). No new personal data category: consent choices use `preference`.

## Local decisions

- The time of the decision is `clock.now()` at the call; the API has no caller-supplied time. Reason: the story API has no time field.
- History and "current" order by `decided_at`, then by `id` (UUIDv7) for the same instant. Reason: two decisions in the same millisecond still have a defined order.
- `purpose` is a free `text`, not an enum. Reason: the story names marketing e-mails only as an example.

## Out of scope

- The consent screens.
- The e-mail marketing tool interface.
- The migration of old consents (the `import` channel exists, the import job does not).

## Open questions

1. **Reading of T3-AC-004.** The register says a record shows "its type, its text version, its date, its source and its withdrawal". The story maps type → `purpose`, source → `channel` (`web`, `advisor`, `import`), withdrawal → a new record with `granted: false`. Is a withdrawal as a separate record the baseline reading, or must the original record show its own withdrawal date? If it differs, a change record is needed (trigger 5).
2. **Purpose values.** Is `purpose` a closed list (for example `marketing-email`) owned by `identity` or a rule set in `kernel`, or free text as planned?
3. **Event payload.** Is it acceptable that `purpose` and `granted` (a consent choice, personal data by the data conventions) are in the event payload, or must the payload carry IDs only (`consentId`, `personId`) and subscribers read via `currentConsent`?
4. **Data category.** Is `preference` the right category for consent columns, or does privacy want a new category `consent` (that would add a category and stay trigger 3)?

## Deviations

Written during the implementation.
