# AN-900: Record a consent for a person

- **Jira:** AN-900
- **Gate:** design (triggers 2 and 3)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v<version>
- **Module:** identity. Touches: none (other modules learn about consent changes through the new event `identity.consent-recorded`; no subscriber exists yet)

## Context

The platform records a person's consents, for example for marketing e-mails, and head office must be able to prove each one (T4 privacy controls). `identity` owns consents (architecture section 4, T3-D-009: one person record with roles).

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| T3-AC-004 | `packages/core/src/identity/consent.test.ts` |

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API, new rows:
    - `createIdentity({ repo, consents, bus, clock })`: new dependency `consents: ConsentRepository`.
    - `.recordConsent({ personId, purpose, textVersion, channel, granted }): Promise<ConsentRecord>`: appends a record. Throws `PersonNotFoundError` for an unknown person. Publishes `identity.consent-recorded`.
    - `.currentConsent(personId, purpose): Promise<ConsentRecord | null>`: the latest record for that purpose.
    - `.consentHistory(personId): Promise<ConsentRecord[]>`: all records of the person, oldest first.
    - `InMemoryConsentRepository`, `PersonNotFoundError`.
    - Types `ConsentRecord`, `ConsentChannel` (`"web" | "advisor" | "import"`), `RecordConsentInput`, `ConsentRepository`, `ConsentRecorded`.
  - Events: `identity.consent-recorded`, Emits.
  - Invariants: a consent record is never changed or deleted; a new decision appends a record. The current decision is the latest record per person and purpose (T3-AC-004).
  - Tables: `identity.consent`.
- **Contracts:** new event `identity.consent-recorded` (`DomainEvent<"identity.consent-recorded", { consentId, personId }>`). Published after the record is stored. The payload holds IDs only (events convention); a subscriber reads the decision with `currentConsent` / `consentHistory`. ADR to be written: `docs/adr/0017-consent-recorded-event.md`.
- **Repository:** `ConsentRepository { append(record): Promise<void>; listByPerson(personId): Promise<ConsentRecord[]> }`. No update or delete method, so the API cannot change a record.
- **Schema:** new table `identity.consent` in `schema.ts`, wrapped in `withDataMeta`:

  | Column | Type | Data metadata |
  |---|---|---|
  | `id` | `uuid` primary key (UUIDv7) | `notPersonal` |
  | `person_id` | `uuid` not null, references `identity.person.id` | `notPersonal` (a key, like `person.id`) |
  | `purpose` | `text` not null | personal, category `preference`, purpose "Prove the consent of the person (T4 privacy controls)", owner `identity`, retention `account lifetime + 3 years` |
  | `text_version` | `text` not null | `notPersonal` (the version of the consent text, the same for everyone) |
  | `channel` | `text` not null (`web`, `advisor`, `import`) | `notPersonal` |
  | `granted` | `boolean` not null | personal, category `preference`, same purpose, owner and retention as `purpose` |
  | `decided_at` | `timestamptz` not null | `notPersonal` |

  Index on (`person_id`, `decided_at`). Retention from [data conventions](../../conventions/data.md): consent records `account lifetime + 3 years`.

## Local decisions

- The AC words map onto fields: "type" → `purpose`, "source" → `channel`, "date" → `decidedAt`, "withdrawal" → `granted: false`. This is naming, not a change of the AC.
- `decidedAt` comes from the injected `clock` at the time of the call. The API takes no decision time, because importing old consents (which would need one) is out of scope.
- The order "oldest first" uses `decidedAt`, then `id` (UUIDv7, so it also sorts by time) when two records have the same instant.
- `purpose` is free text, not a closed list, because the story names no list of purposes. See open question 1.
- `brand` is not a column: a consent belongs to a person, and the person already has a brand.

## Out of scope

- The consent screens.
- The interface to the e-mail marketing tool.
- The migration of old consents.

## Open questions

1. Is `purpose` a closed list (for example `marketing-email`)? If yes, which values, and where do they live (the kernel rule set later)?
2. Should the event payload also carry `purpose` and `granted`, so that the future e-mail marketing integration does not have to call `identity` back? The events convention says IDs only; this spec follows it.
3. Category of `purpose` and `granted`: `preference` is proposed. It is a category no table uses yet (trigger 3). Confirm, or name another category.

## Deviations

None.
