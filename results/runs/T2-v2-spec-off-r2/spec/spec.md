# AN-902: Read advisor master data from the ERP

- **Jira:** AN-902
- **Gate:** design (trigger 2)
- **Status:** Draft
- **Approved-by:** —
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: integration (new public API `readAdvisor`, called by identity), `erp-port` (new operation), `erp-fake` (seed data), `apps/worker` (wiring)

## Context

Head office needs the advisor master data that the ERP leads (T2-C-010). The identity module owns the person and its roles (T3-D-009) and reads customer and advisor master data through the integration module (T3-D-005). This story adds the advisor read on that path.

## Acceptance criteria

None. The story serves T2-C-010 (customer and advisor master data), within T3-D-005, T3-AC-001 and T2-D-009. Tests cite no AC ID.

| ID | Test |
|---|---|
| None | `packages/core/src/identity/identity.test.ts`, `packages/core/src/integration/integration.test.ts`, `packages/erp-fake/src/erp-fake.test.ts`, `apps/worker/src/worker.test.ts` |

## Gate

1. Module or boundary: no new module. identity gains a dependency on the public API of integration. The architecture (section 4) already names this path for identity, and integration does not depend on identity, so the direction does not change. Not a trigger.
2. Contract: **yes**. A new ERP port operation `readAdvisor` and a new payload contract `AdvisorMasterData`. ADR-0017.
3. Table: no. The read is live; no table and no column.
4. Technology or external service: no.
5. Contradiction of a Discovery ID: no.

## Design increment

- **Contracts** (`packages/erp-port/src/index.ts`):
  - `AdvisorMasterData` (Zod): `advisorNumber: string` (`^B\d{5}$`), `givenName: string`, `familyName: string`, `email: string` (e-mail), `active: boolean`, `sourceVersion: string`.
  - `ErpPort.readAdvisor(advisorNumber: string): Promise<AdvisorMasterData | null>`. `null` when the ERP has no such advisor. Throws `ErpUnavailableError` when the ERP is down.
  - ADR-0017 records the operation and the payload.
- **erp-fake:** `fakeAdvisors: AdvisorMasterData[]` with one invented advisor `B20001` (`@example.test` address, `active: true`, `sourceVersion: "v1"`). `readAdvisor` returns a copy, or `null`; with `unavailable: true` it throws `ErpUnavailableError("readAdvisor")`.
- **Module file `integration/AGENTS.md`**, public API row:
  - `Integration.readAdvisor(advisorNumber)` | Advisor master data as `ErpRead<AdvisorMasterData>` or `null`
- **Module file `identity/AGENTS.md`**:
  - `createIdentity({ repo, bus, integration, clock })` | Builds the module service. `integration` is the `Integration` service, injected by the worker
  - `.getAdvisor(advisorNumber)` | Advisor master data from the ERP as `Advisor`, or `null` when the ERP has no such advisor. Throws `ErpUnavailableError` when the ERP is down
  - `Advisor` type: `{ advisorNumber, givenName, familyName, email, active, sourceVersion, readAt }`
  - Invariant (exists already, now used): ERP master data comes through the `integration` module, never from the ERP port.
- **Worker:** `createApp()` passes `integrationApi` to `createIdentity`; `app.identity.getAdvisor` is the identity method. `apps/worker/AGENTS.md` does not change.
- **Events:** none.
- **Schema:** none.

## Local decisions

- Port operation name `readAdvisor` and `Integration.readAdvisor`: same pattern as `readCustomer`.
- The ERP "active flag" maps to `active: boolean`; the ERP's version maps to `sourceVersion`. Mapping, not a contradiction.
- `getAdvisor` reads live through integration and keeps no copy: the story asks for the ERP data with its read time, the same as `readCustomer`.
- `getAdvisor` flattens `ErpRead` into the shape the story names and drops `source` (always `"erp"`).
- An inactive advisor is returned with `active: false`, not `null`: the advisor exists in the ERP.
- `getAdvisor` does not catch `ErpUnavailableError`; the caller decides the fallback (ERP conventions).
- A malformed advisor number is passed to the ERP as is; the ERP has no such advisor, so the result is `null`.
- `integration` is a required dependency of `createIdentity`; the one existing test call gets a stub.
- Identity tests use a stub `Integration` (identity may not load `erp-fake`); the worker test covers the path end to end with the fake ERP.

## Out of scope

- A read copy of advisors in `erp_copy` and its refresh schedule.
- The advisor structure, its history and the customer assignment.
- A head office screen or endpoint, and its authorisation.
- The NAV adapter mapping.
- Linking an advisor to a person record or an advisor role.

## Open questions

None.

## Deviations

Written during the implementation.
