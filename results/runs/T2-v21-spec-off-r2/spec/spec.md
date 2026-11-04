# AN-902: Read advisor master data from the ERP

- **Jira:** AN-902
- **Gate:** design (trigger 2)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: `integration` through a new read on its public API (`readAdvisor`), the ERP port contract (`packages/erp-port`), the fake adapter (`packages/erp-fake`), the wiring in `apps/worker`

## Context

Head office needs the advisor master data that the ERP runs (discovery baseline, "The ERP runs"). The `identity` module reads customer and advisor master data from the ERP through `integration` (architecture.md section 4), and every module reaches the ERP only through `integration` and its port (T3-D-005, T3-AC-001). The read records its source version and read time (T2-D-009).

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | The story has no AC IDs. It serves T3-D-005, T2-D-009 and T3-AC-001 (owner `integration`, not changed by this story). Tests: `packages/erp-fake/src/erp-fake.test.ts`, `packages/core/src/integration/integration.test.ts`, `packages/core/src/identity/identity.test.ts`, `apps/worker/src/worker.test.ts`; titles without an AC ID |

## Design increment

- **Module file `identity/AGENTS.md`:**
  - Public API: `createIdentity({ repo, bus, clock, integration })`. `integration` is the `Integration` service of the `integration` module.
  - Public API: `.getAdvisor(advisorNumber: string): Promise<Advisor | null>`. Reads the advisor through `integration.readAdvisor`. Returns `null` when the ERP has no such advisor. Throws `ErpUnavailableError` (from the port, unchanged) when the ERP is down.
  - Public API: type `Advisor = { advisorNumber: string; givenName: string; familyName: string; email: string; active: boolean; sourceVersion: string; readAt: string }`. `readAt` is ISO 8601 UTC from the clock of `integration`.
  - Invariant: advisor master data is read from the ERP on each call, not stored in `identity` (no table).
  - Events: none. AC IDs: unchanged.
- **Module file `integration/AGENTS.md`:** public API row `Integration.readAdvisor(advisorNumber)`: advisor master data as `ErpRead<AdvisorMasterData>` or `null`.
- **Package files:** `erp-port/AGENTS.md` adds `AdvisorMasterData`; `erp-fake/AGENTS.md` adds `fakeAdvisors`; `apps/worker/AGENTS.md` notes that `app.identity.getAdvisor` is wired.
- **Contracts:** new ERP port operation (ADR-0017):
  - `ErpPort.readAdvisor(advisorNumber: string): Promise<AdvisorMasterData | null>`. `null` when the ERP has no advisor with this number.
  - `AdvisorMasterData` (Zod, `packages/erp-port/src/index.ts`): `advisorNumber` string `/^B\d{5}$/`; `givenName` string; `familyName` string; `email` string, e-mail; `active` boolean; `sourceVersion` string.
  - Fake adapter: seed advisor `B20001` (invented name, `@example.test` address, `active: true`, a `sourceVersion`). Throws `ErpUnavailableError("readAdvisor")` with `unavailable: true`.
  - No event.
- **Schema:** none. The advisor data is personal (name, e-mail) but is not stored; no table, no column.

## Local decisions

- `getAdvisor` returns a flat object, not `ErpRead<T>`: the story fixes the shape. `source` is dropped because it is always `"erp"`.
- `ErpUnavailableError` is passed on to the caller: the ERP conventions say the caller decides the fallback, and head office has no fallback yet.
- An inactive advisor is returned with `active: false`, not as `null`: the story maps `null` only to "the ERP has no such advisor".
- `identity` does not validate the format of the advisor number; the ERP answers `null` for an unknown number. The port schema validates the number in the payload.
- `apps/worker` passes the existing `integrationApi` into `createIdentity`; `identity` → `integration` is the read direction of architecture.md section 4 and makes no cycle (`integration` imports only `kernel`).

## Out of scope

- Storing a copy of advisor data (`erp_copy`), refresh runs, reconciliation.
- The advisor structure, assignment of customers to advisors, the pilot switch.
- Authorisation of head office staff for this read, and a head office screen.
- Linking an advisor to a person record (T3-D-009).

## Open questions

None.

## Deviations

Written during the implementation.
