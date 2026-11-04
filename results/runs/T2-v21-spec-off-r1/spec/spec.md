# AN-902: Read advisor master data from the ERP

- **Jira:** AN-902
- **Gate:** design (trigger 2)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: `integration` through a new public API function (`readAdvisor`); `erp-port` (new operation and contract); `erp-fake` (seed data); `apps/worker` (wiring)

## Context

Head office needs the advisor master data that the ERP runs (advisor number, names, e-mail, active flag). Architecture section 4 lists advisor master data as an ERP read of `identity` through `integration`. The story serves T2-C-010 (customer and advisor master data), T3-D-005 and T3-AC-001 (ERP access only through `integration`) and T2-D-009 (source and version on every read). The story names no AC ID of its own.

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | The story has no AC ID. See open question 1 |

Behaviour to test (from the story text):

1. `getAdvisor("B20001")` returns `{ advisorNumber, givenName, familyName, email, active, sourceVersion, readAt }` from the fake ERP. `readAt` is the clock time.
2. `getAdvisor` of an advisor number the ERP does not know returns `null`.
3. `createApp()` exposes `app.identity.getAdvisor`; it reads through `integration`, never through the port.
4. The fake ERP returns a copy of `B20001` and throws `ErpUnavailableError` with `unavailable: true`.

## Design increment

- **Module file** `packages/core/src/identity/AGENTS.md`:
  - Public API: `createIdentity({ repo, bus, integration, clock })`; new row `.getAdvisor(advisorNumber)` → `Promise<Advisor | null>`, master data of an advisor from the ERP through `integration`, or `null`; new type `Advisor`.
  - Invariants: unchanged. "ERP master data comes through the `integration` module, never from the ERP port" now has its first user.
  - AC IDs: unchanged until open question 1 is answered.
- **Module file** `packages/core/src/integration/AGENTS.md`: new row `Integration.readAdvisor(advisorNumber)` → `ErpRead<AdvisorMasterData> | null`.
- **Package file** `packages/erp-port/AGENTS.md`: new row `AdvisorMasterData`. `packages/erp-fake/AGENTS.md`: new row `fakeAdvisors`.
- **Contracts** (ADR-0017):
  - ERP port operation `ErpPort.readAdvisor(advisorNumber: string): Promise<AdvisorMasterData | null>`. `null` when the ERP has no such advisor. Throws `ErpUnavailableError` when the ERP is down.
  - Payload `AdvisorMasterData` (Zod): `advisorNumber: string /^B\d{5}$/`, `givenName: string`, `familyName: string`, `email: string (email)`, `active: boolean`, `sourceVersion: string`.
  - Integration API `Integration.readAdvisor(advisorNumber: string): Promise<ErpRead<AdvisorMasterData> | null>`.
  - Identity API type `Advisor = { readonly advisorNumber: string; readonly givenName: string; readonly familyName: string; readonly email: string; readonly active: boolean; readonly sourceVersion: string; readonly readAt: string }`.
  - No event.
- **Schema:** none. The advisor data is read, not stored. No table, no column.
- **Fake data:** `fakeAdvisors` in `erp-fake` with `B20001` (the advisor of the seed customer `K100001`): invented names, `@example.test` e-mail, `active: true`, `sourceVersion: "v1"`.

## Local decisions

- `IdentityDeps.integration` is required, not optional: `getAdvisor` cannot work without it, and a required field makes the worker wiring a type error when it is missing.
- `Advisor` flattens `ErpRead`: it keeps `sourceVersion` and `readAt` and drops `source`, which is always `"erp"`. The story names these fields (T2-D-009 is kept: version and read time are on the result).
- `getAdvisor` lets `ErpUnavailableError` pass through; the caller decides the fallback (ERP conventions).
- `identity` tests pass a stub `Integration`; only `integration` tests and the worker load `erp-fake` (rule 2).
- The new dependency `identity` → `integration` follows architecture section 4 ("Reads from the ERP (through `integration`)"); it is not a new direction. The ADR records it.

## Out of scope

- A copy of the advisor master data in `erp_copy`, its sync and its maximum age.
- The advisor structure, the customer-to-advisor assignment, roles of the person record.
- A head office screen or endpoint, and the staff role that may call it.

## Open questions

1. **AC ID.** The story has no AC ID, so the tests cannot start with one (hard rule 5). Which AC ID does this story serve, or should tests cite T3-AC-001 for the read path through `integration`?
2. **Live read or copy.** The baseline (T2 section 4) allows synchronous ERP calls only for payment options, vouchers and order history; "everything else is asynchronous". T2-C-010 is an inbound master-data flow. Is a live `readAdvisor` acceptable for this story (as `readCustomer` is today), or must `getAdvisor` read an `erp_copy` row kept by T2-C-010? A copy changes the design (a table, a sync, a maximum age) and could need a change record.
3. **Malformed advisor number.** An input that is not `B` + 5 digits: return `null` (the ERP has no such advisor) or throw a validation error before the ERP call? Proposal: return `null`, without an ERP call.
4. **Inactive advisor.** The proposal returns an inactive advisor with `active: false`, not `null`. Confirm.

## Deviations

Written during the implementation.
