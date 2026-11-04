# AN-900: Record a consent for a person

- **Jira:** AN-900
- **Gate:** design (triggers 2, 3, 5)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: none (other modules learn about changes through the new event `identity.consent-changed`; no subscriber in this story)

## Context

Head office must prove each consent of a person (T4 privacy controls). `identity` owns consents (architecture section 4, T3-D-009). This story adds the append-only consent record, the reads of the current decision and the history, and the event that tells other modules about a change.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| T3-AC-004 | `packages/core/src/identity/consent.test.ts` |

## Design increment

- **Module file** (`packages/core/src/identity/AGENTS.md`):
  - Owns: no change (consents are listed already).
  - Public API, new rows:
    - `.recordConsent({ personId, purpose, textVersion, channel, granted })` → `Promise<Consent>`. Appends a record. Publishes `identity.consent-changed`. Throws `PersonNotFoundError` for an unknown person.
    - `.currentConsent(personId, purpose)` → `Promise<Consent | null>`. The latest record for the purpose, or `null`.
    - `.consentHistory(personId)` → `Promise<Consent[]>`. All records of the person, oldest first.
    - `InMemoryConsentRepository`, `PersonNotFoundError`.
    - Types: `Consent`, `ConsentChannel` (`"web" | "advisor" | "import"`), `ConsentChanged`, `ConsentRepository`, `RecordConsentInput`.
  - `IdentityDeps` gets `consents: ConsentRepository`.
  - Invariants, new: "A consent record is never changed or deleted; a new decision adds a record. The current decision is the latest record per person and purpose (T3-AC-004)."
  - Acceptance criteria: T3-AC-003, T3-AC-004 (no change).
- **Contracts:** new event `identity.consent-changed`, emitted by `identity`, after each `recordConsent`.
  - Type: `ConsentChanged = DomainEvent<"identity.consent-changed", { consentId: string; personId: string; purpose: string; granted: boolean }>`.
  - Needs ADR-0017 "Consent record and consent-changed event" (trigger 2).
- **Repository:** `ConsentRepository { insert(consent): Promise<void>; listByPerson(personId): Promise<Consent[]> }`. No update or delete method, so the type enforces append-only.
- **Schema:** new table `identity.consent` in `identity/schema.ts`, wrapped in `withDataMeta`:

  | Column | Type | Metadata |
  |---|---|---|
  | `id` | `uuid` PK (UUIDv7) | `notPersonal` |
  | `person_id` | `uuid` not null | `notPersonal` (a key, like `person.id`) |
  | `purpose` | `text` not null | `notPersonal` |
  | `text_version` | `text` not null | `notPersonal` |
  | `channel` | `text` not null (`web`, `advisor`, `import`) | `notPersonal` |
  | `granted` | `boolean` not null | personal, category `preference`, purpose "Prove the consent decision of the person (T4)", owner `identity`, retention `account lifetime + 3 years` |
  | `decided_at` | `timestamptz` not null | `notPersonal` |

  Index on (`person_id`, `decided_at`). No new personal data category.

## Local decisions

- `decided_at` is the time of the call from the module clock (UTC ISO string); the caller does not pass it. Reason: the story's API has no time parameter.
- History order: by `decided_at`, then by `id` (UUIDv7 is time ordered), so two decisions in the same millisecond keep their order.
- `purpose` and `textVersion` are non-empty strings, trimmed; an empty value throws. Reason: a record without them proves nothing.
- `PersonNotFoundError` is a new error class next to `EmailAlreadyRegisteredError`.

## Out of scope

- The consent screens and the cookie banner (TD-37).
- The interface to the e-mail marketing tool, and any subscriber of `identity.consent-changed`.
- The migration of old consents and their legal classification.

## Open questions

1. **Reading of T3-AC-004 (trigger 5).** The register text is "type, text version, date, source and withdrawal". The story reads it as: type → `purpose`, source → `channel` (`web`, `advisor`, `import`), withdrawal → a new record with `granted: false`, and adds "records are never changed or deleted". Is this reading accepted, or does it need a change record in `docs/changes/`?
2. **Allowed purposes.** T3-O-003 says the consent types are the four types of architecture section 4, defined by the data protection officer. The repository does not list them. Is `purpose` a closed union of the four types (which?) or free text until T3-O-003 closes?
3. **Event payload.** The convention says a payload holds IDs. The proposal also carries `purpose` and `granted`, so that a subscriber (e-mail marketing sync) needs no read back. Accept, or IDs only (`consentId`, `personId`)?
4. **Retention per type.** T3-O-003 says the retention is per consent type. The proposal uses the default `account lifetime + 3 years` from the data conventions for all records. Accept for now?
5. **Brand.** Does a consent need a `brand` column (T3-D-013: entities a second brand would split)? The proposal has none; the person carries the brand.

## Deviations

None.
