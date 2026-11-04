# AN-900: Record a consent for a person

- **Jira:** AN-900
- **Gate:** design (triggers 2 and 3)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none (other modules can subscribe to the new event `identity.consent-recorded`; no subscriber in this story)

## Context

The platform records the consents of a person, for example for marketing e-mails, and head office must prove each consent (T4 privacy controls). `identity` owns consents (architecture section 4, T3-D-009). This story adds the append-only consent record and its reads.

Gate triggers: 2, a new event `identity.consent-recorded` (ADR-0017); 3, a new table `identity.consent`. Triggers 1 and 4 do not apply (no new module, boundary or dependency). Trigger 5: see open question 1.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| T3-AC-004 | `packages/core/src/identity/consent.test.ts` |

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Public API:
    - `createIdentity({ repo, consents, bus, clock })`: new required dependency `consents: ConsentRepository`.
    - `.recordConsent({ personId, purpose, textVersion, channel, granted }): Promise<ConsentRecord>`. Adds a record. Publishes `identity.consent-recorded`. Throws `PersonNotFoundError` for an unknown person, `InvalidConsentError` for an empty `purpose` or `textVersion` or a channel outside `web | advisor | import`.
    - `.currentConsent(personId, purpose): Promise<ConsentRecord | null>`: the latest record of the person for the purpose, or `null`.
    - `.consentHistory(personId): Promise<ConsentRecord[]>`: all records of the person, oldest first.
    - New exports: `InMemoryConsentRepository`, `PersonNotFoundError`, `InvalidConsentError`; types `ConsentRecord`, `ConsentRepository`, `ConsentChannel`, `ConsentRecorded`, `RecordConsentInput`.
  - Invariant: consent records are append-only. `ConsentRepository` has `insert` and reads only; no update, no delete. A withdrawal is a new record with `granted: false` (T3-AC-004).
  - Invariant: "latest" is the highest `decidedAt`; at the same instant, the later insert (UUIDv7 `id` order).
  - AC IDs: T3-AC-003, T3-AC-004 (unchanged list; T3-AC-004 now has a test).
- **Types:**

  ```ts
  type ConsentChannel = "web" | "advisor" | "import";
  interface ConsentRecord {
    readonly id: string;          // UUIDv7
    readonly personId: string;
    readonly purpose: string;     // e.g. "marketing-email"
    readonly textVersion: string; // version of the consent text shown
    readonly channel: ConsentChannel;
    readonly granted: boolean;    // true = given, false = withdrawn
    readonly decidedAt: string;   // ISO UTC, from the clock
  }
  ```

- **Contracts:** new event (ADR-0017).
  - `identity.consent-recorded`, `DomainEvent<"identity.consent-recorded", { consentId, personId, purpose }>`. Published after the insert, once per record. The payload holds IDs and the purpose, not the decision (event conventions: IDs, not copies of personal data). A subscriber reads the decision with `currentConsent(personId, purpose)`. See open question 2.
- **Schema:** new table `identity.consent`, wrapped in `withDataMeta`.

  | Column | Type | Metadata |
  |---|---|---|
  | `id` | `uuid` primary key | `notPersonal` |
  | `person_id` | `uuid` not null, references `identity.person(id)` | `notPersonal` (same as `person.id`) |
  | `purpose` | `text` not null | `notPersonal` (a catalogue value) |
  | `text_version` | `text` not null | `notPersonal` (a catalogue value) |
  | `channel` | `text` not null | `notPersonal` (`web`, `advisor`, `import`) |
  | `granted` | `boolean` not null | personal, category `preference`, purpose "Prove the consent decision of the person (T4)", owner `identity`, retention `account lifetime + 3 years` |
  | `decided_at` | `timestamp with time zone` not null | personal, category `preference`, purpose "Prove when the person decided (T4)", owner `identity`, retention `account lifetime + 3 years` |

  Index on `(person_id, purpose, decided_at)`. No update or delete path in code.

## Local decisions

- Jira "purpose" = register "type"; "channel" = "source"; "time of the decision" = "date"; "decision withdrawn" = "withdrawal". Mapping of names, not a change of the text.
- `purpose` and `textVersion` are free non-empty strings, not a closed list: the purposes and text versions are content that head office changes without a release (Discovery baseline section 2, settings).
- The decision time is the clock time of the call. The API has no `decidedAt` input; the migration of old consents (out of scope) will decide whether import needs one.
- No `brand` column: a consent belongs to a person, and the person carries the brand (T3-D-013).
- A separate `ConsentRepository` rather than new methods on `PersonRepository`: it has no update or delete, which makes the append-only rule part of the type.

## Out of scope

- The consent screens.
- The interface to the e-mail marketing tool (Inxmail) and any subscriber of the new event.
- The migration of old consents with their legal classification (T1).
- The data-subject request deletion of consent records (T3-C-003).

## Open questions

1. **Trigger 5?** The register text of T3-AC-004 says "a consent record shows … its withdrawal". The story models a withdrawal as a new record (`granted: false`) and never changes a record. We read this as a mapping, not a contradiction. The approver confirms, or we write a change record.
2. **Event payload.** Proposed `{ consentId, personId, purpose }` without `granted`, per the event convention. A subscriber such as the Inxmail sync then calls `currentConsent`. Alternative: add `granted` to the payload, which needs an exception to the convention.
3. **Data category.** The data categories have no `consent`. Proposed `preference` for `granted` and `decided_at`. A new category `consent` would change the data conventions.

## Deviations

Written during the implementation.
