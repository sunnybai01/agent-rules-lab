# AN-902: Advisor master data from the ERP for head office

- **Jira:** AN-902
- **Gate:** design (trigger 1, trigger 2)
- **Status:** Draft
- **Approved-by:** <GitHub login> <YYYY-MM-DD>
- **Baseline:** Discovery v0.1
- **Module:** identity. Touches: integration (new public API function `readAdvisor`, called by identity); `erp-port` (new operation); `erp-fake` (seed advisor); `apps/worker` (wiring)

## Context

Head office needs the master data of an advisor (number, names, e-mail, active flag) as the ERP holds it. The ERP is reached only through the `integration` module and its port (T3-D-005), and every read records its source version and read time (T2-D-009). The story has no AC IDs; it serves T3-D-005, T2-D-009 and T3-D-009 (an advisor is a role of the person record that identity owns).

Gate triggers, one by one:

1. **Yes.** `identity` gets a new dependency on the `integration` public API. Today no module of `packages/core` depends on another one.
2. **Yes.** New ERP port operation `readAdvisor` with the payload contract `AdvisorMasterData`.
3. No. No table and no column.
4. No. No technology, dependency or service.
5. No. Nothing contradicts a Discovery ID.

ADR: [ADR-0017](../../adr/0017-advisor-master-data-read.md) (Proposed).

## Acceptance criteria

IDs only; `pnpm ids show <ID>` prints the text.

| ID | Test |
|---|---|
| None | The story has no AC IDs. Tests are named after the Discovery IDs they serve (see Open questions 1) in `packages/core/src/identity/identity.test.ts`, `packages/core/src/integration/integration.test.ts`, `packages/erp-fake/src/erp-fake.test.ts`, `apps/worker/src/worker.test.ts` |

## Design increment

- **Module file `identity/AGENTS.md`:**
  - Public API row: `.getAdvisor(advisorNumber)` — reads advisor master data from the ERP through `integration`; returns `Advisor` or `null`.
  - Public API row: `Advisor` type.
  - `createIdentity({ repo, bus, clock, integration })`: new required dependency `integration: Pick<Integration, "readAdvisor">`.
  - Invariant: advisor master data is read through `integration.readAdvisor`, never from the ERP port, and is not stored by identity.
  - Signature:

    ```ts
    interface Advisor {
      advisorNumber: string;   // "B" + 5 digits
      givenName: string;
      familyName: string;
      email: string;
      active: boolean;
      sourceVersion: string;   // from ErpRead.sourceVersion
      readAt: string;          // ISO UTC, from ErpRead.readAt
    }
    getAdvisor(advisorNumber: string): Promise<Advisor | null>;
    ```

- **Module file `integration/AGENTS.md`:** public API row `Integration.readAdvisor(advisorNumber)` — advisor master data as `ErpRead<AdvisorMasterData>` or `null`.
- **Contracts:**
  - `erp-port`: Zod schema and type `AdvisorMasterData`:
    `advisorNumber: z.string().regex(/^B\d{5}$/)`, `givenName: z.string()`, `familyName: z.string()`, `email: z.string().email()`, `active: z.boolean()`, `sourceVersion: z.string()`.
  - `erp-port`: `ErpPort.readAdvisor(advisorNumber: string): Promise<AdvisorMasterData | null>` — `null` when the ERP has no such advisor; throws `ErpUnavailableError` when the ERP is down.
  - `erp-fake`: `fakeAdvisors` seed with `B20001` (invented name, `@example.test` e-mail, `active: true`); `readAdvisor` supports `unavailable`.
  - `apps/worker`: `createApp()` passes `integration` into `createIdentity`; `app.identity.getAdvisor` is exposed.
  - Events: none.
- **Schema:** none. No table, no column.

## Local decisions

- `getAdvisor` drops `source` from the `ErpRead` and flattens `data` with `sourceVersion` and `readAt`: the story fixes the return shape.
- Identity depends on `Pick<Integration, "readAdvisor">`, not the whole service: the smallest dependency, easy to fake in tests.
- `B20001` is the seed advisor because the seed customer `K100001` already names it.

## Out of scope

- A read copy (`erp_copy`) or cache of advisor data, and reconciliation.
- Linking the advisor to a person record or an advisor role in `identity.person`.
- Authorisation of head office staff (TD-12) and any head office screen.
- Downline, assignment of customers to advisors.

## Open questions

1. **Test names without AC IDs.** Hard rule 5 wants test titles to start with an AC ID. The story has none. Is there an AC for advisor master data to add to the story, or may the tests start with the Discovery ID they serve (`T3-D-005: ...`)?
2. **ERP down.** When the ERP is down, should `getAdvisor` let `ErpUnavailableError` through (proposal, as `readCustomer` does), or return a fallback?
3. **Malformed advisor number.** For input that is not `B` + 5 digits, return `null` (proposal: the ERP has no such advisor, no ERP call) or throw a validation error?
4. **Validation of the ERP payload.** Should `integration` parse the adapter result with `AdvisorMasterData` (Zod) before it returns it? `readCustomer` does not today. Proposal: keep it as `readCustomer` does, and decide for all reads in a separate story.

## Deviations

Written during the implementation: each difference from the approved design, and why. "None." if there is none.
