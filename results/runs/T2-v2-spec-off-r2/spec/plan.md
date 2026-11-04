# AN-902: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Write ADR-0017 "ERP operation readAdvisor" (Proposed): the operation, the `AdvisorMasterData` payload, T2-C-010, T3-D-005. Add it to the index and move the next free number (files: `docs/adr/0017-erp-read-advisor.md`, `docs/adr/README.md`)
- [ ] 2. Test: the fake ERP returns `B20001`, returns `null` for an unknown number, and throws `ErpUnavailableError` when unavailable → add `AdvisorMasterData` and `ErpPort.readAdvisor`; add `fakeAdvisors` and `readAdvisor` to the fake (files: `packages/erp-fake/src/erp-fake.test.ts`, `packages/erp-port/src/index.ts`, `packages/erp-fake/src/index.ts`)
- [ ] 3. Test: `readAdvisor` returns `ErpRead<AdvisorMasterData>` with `source`, `sourceVersion`, `readAt` from the clock, or `null` → add `Integration.readAdvisor` (files: `packages/core/src/integration/integration.test.ts`, `packages/core/src/integration/index.ts`)
- [ ] 4. Test with a stub `Integration`: `getAdvisor` returns the flat `Advisor` shape, `null` when integration returns `null`, and passes `ErpUnavailableError` through → add the `integration` dependency, `getAdvisor` and the `Advisor` type; export `Advisor` (files: `packages/core/src/identity/identity.test.ts`, `packages/core/src/identity/service.ts`, `packages/core/src/identity/index.ts`)
- [ ] 5. Test: `createApp().identity.getAdvisor("B20001")` returns the fake advisor, and `null` for `B99999` → pass `integrationApi` to `createIdentity` (files: `apps/worker/src/worker.test.ts`, `apps/worker/src/index.ts`)
- [ ] 6. Update the module files: `identity/AGENTS.md` (`createIdentity` signature, `getAdvisor`, `Advisor`), `integration/AGENTS.md` (`readAdvisor`), `erp-port/AGENTS.md` (`AdvisorMasterData`), `erp-fake/AGENTS.md` (`fakeAdvisors`). Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
