# AN-900: Record a consent for a person

- **Jira:** AN-900
- **Gate:** design (triggers 2, 3)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none (other modules learn about a change through the new event `identity.consent-recorded`; no subscriber in this story)

## Context

The platform records the consents of a person, for example for marketing e-mails, and head office must prove each consent (T4 privacy controls). The `identity` module owns consents (architecture section 4, T3-D-009). This story adds the append-only consent record, the reads, and the event that tells other modules about each change.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| T3-AC-004 | `packages/core/src/identity/consent.test.ts` |

## Gate

1. Module or boundary: no. The consent lives in `identity`, which owns consents.
2. Event contract: **yes**, new event `identity.consent-recorded`. ADR: [ADR-0017](../../adr/0017-consent-recorded-event.md).
3. Table: **yes**, new table `identity.consent` with personal columns (category `preference`).
4. Technology or external service: no.
5. Contradiction of a Discovery ID: no. The text of T3-AC-004 is mapped onto fields (see "Local decisions").

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):

  | Export | Use |
  |---|---|
  | `createIdentity({ repo, consents, bus, clock })` | Builds the module service. `consents` is new and required |
  | `.recordConsent({ personId, purpose, textVersion, channel, granted }): Promise<ConsentRecord>` | Appends a consent record. Throws `PersonNotFoundError` for an unknown person. Publishes `identity.consent-recorded` |
  | `.currentConsent(personId, purpose): Promise<ConsentRecord \| null>` | The latest record of the person for the purpose, or `null` |
  | `.consentHistory(personId): Promise<ConsentRecord[]>` | All records of the person, oldest first |
  | `InMemoryConsentRepository` | Append-only store for tests and the fixture |
  | `PersonNotFoundError` | Thrown when the person does not exist |
  | `ConsentRecord`, `ConsentChannel`, `ConsentRepository`, `RecordConsentInput`, `ConsentRecorded` | Types of the record, the channel, the store, the input and the event |

  ```ts
  type ConsentChannel = "web" | "advisor" | "import";
  interface ConsentRecord {
    readonly id: string;          // UUIDv7
    readonly personId: string;
    readonly purpose: string;
    readonly textVersion: string;
    readonly channel: ConsentChannel;
    readonly granted: boolean;    // true = given, false = withdrawn
    readonly decidedAt: string;   // ISO UTC, from the clock
  }
  interface ConsentRepository {   // no update, no delete
    append(record: ConsentRecord): Promise<void>;
    listByPerson(personId: string): Promise<ConsentRecord[]>; // oldest first
  }
  ```

  - Invariant: consent records are never changed or deleted; a new decision appends a record (T3-AC-004). Returned records are frozen.
  - Invariant: the current consent for a purpose is the last appended record for that person and purpose.
  - Events row: `identity.consent-recorded` | Emits | `consentId`, `personId`, `purpose`.
  - AC IDs: T3-AC-003, T3-AC-004 (unchanged list).

- **Contracts:** event `identity.consent-recorded`, declared as `DomainEvent<"identity.consent-recorded", { consentId: string; personId: string; purpose: string }>`, published after the append. The payload holds IDs and the purpose, not the decision (a consent choice is personal data, [event conventions](../../conventions/events.md)); a subscriber reads the decision with `currentConsent`. No ERP operation.

- **Schema:** table `identity.consent` in `packages/core/src/identity/schema.ts`, wrapped in `withDataMeta`.

  | Column | Type | Data metadata |
  |---|---|---|
  | `id` | `uuid` primary key | `notPersonal` |
  | `person_id` | `uuid` not null, references `identity.person.id` | `notPersonal` (same as `person.id`) |
  | `purpose` | `text` not null | personal, `preference`, purpose "Prove the consent decision of the person (T4 privacy controls)", owner `identity`, retention `account lifetime + 3 years` |
  | `text_version` | `text` not null | `notPersonal` |
  | `channel` | `text` not null (`web`, `advisor`, `import`) | `notPersonal` |
  | `granted` | `boolean` not null | personal, `preference`, same purpose, owner and retention as `purpose` |
  | `decided_at` | `timestamp with time zone` not null | `notPersonal` |

  Index on (`person_id`, `decided_at`). No unique constraint on (`person_id`, `purpose`): there are many records per purpose.

## Local decisions

- T3-AC-004 "type" → `purpose`; "text version" → `textVersion`; "date" → `decidedAt`; "source" → `channel`; "withdrawal" → a record with `granted: false`. The story defines this mapping; the text of the AC keeps its meaning.
- `decidedAt` comes from the module clock, not from the caller: the platform proves when it recorded the decision. An `import` of old consents (out of scope) may need a caller time; that story decides it.
- Order of the history: append order. IDs are UUIDv7, so the order of `id` equals the append order in the database.
- Retention `account lifetime + 3 years`: the default for consent records in the [data conventions](../../conventions/data.md).
- No `brand` column: the person carries the brand (T3-D-013), and a consent belongs to one person.
- `purpose` is a non-empty string; `recordConsent` rejects an empty `purpose` or `textVersion` with a `TypeError`. `channel` is checked at run time as well, because the screens and the import call through untyped input.

## Out of scope

- The consent screens.
- The interface to the e-mail marketing tool, and any subscriber of `identity.consent-recorded`.
- The migration of old consents (and with it a caller-supplied decision time).
- A Drizzle repository and a database rule against UPDATE and DELETE on `identity.consent`: the module has only in-memory stores today.

## Open questions

1. **Allowed purposes.** T3-O-003 (a decision with an alternative) says the consent types are the four types of section 4, and the data protection officer defines their texts. The register does not name the four types. This spec accepts any non-empty string. Should `purpose` become a fixed list now (which names?), or later, when the data protection officer has named them?
2. **Retention per type.** T3-O-003 also gives the retention to the data protection officer per type. This spec uses the convention default `account lifetime + 3 years` for all. Is that acceptable until the data protection officer has set the retention per type?
3. **Event payload.** The payload omits `granted` to keep personal data out of events; subscribers call `currentConsent`. Is that acceptable for the e-mail marketing integration, or should the event carry the decision?

## Deviations

None.
