# AN-902: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit. Test titles use the AC ID that open question 1 decides.

- [ ] 1. Test: the fake ERP returns a copy of advisor `B20001`, `null` for an unknown number, throws `ErpUnavailableError` with `unavailable: true` → add `AdvisorMasterData` and `ErpPort.readAdvisor` to the port; add `fakeAdvisors` and `readAdvisor` to the fake (files: `packages/erp-port/src/index.ts`, `packages/erp-fake/src/index.ts`, `packages/erp-fake/src/erp-fake.test.ts`)
- [ ] 2. Test: `readAdvisor("B20001")` returns the data with `source`, `sourceVersion` and `readAt` from the clock; `null` for an unknown number → add `Integration.readAdvisor` (files: `packages/core/src/integration/index.ts`, `packages/core/src/integration/integration.test.ts`)
- [ ] 3. Test with a stub `Integration`: `getAdvisor` maps the read to `Advisor`, returns `null` when the read is `null`, and the answer to open questions 3 and 4 → add `Advisor`, `IdentityDeps.integration`, `getAdvisor`; export `Advisor` (files: `packages/core/src/identity/service.ts`, `packages/core/src/identity/person.ts` or a new `advisor.ts`, `packages/core/src/identity/index.ts`, `packages/core/src/identity/identity.test.ts`)
- [ ] 4. Test: `createApp().identity.getAdvisor("B20001")` returns the fake advisor; an unknown number returns `null` → pass `integrationApi` to `createIdentity` (files: `apps/worker/src/index.ts`, `apps/worker/src/worker.test.ts`)
- [ ] 5. Update `packages/core/src/identity/AGENTS.md`, `packages/core/src/integration/AGENTS.md`, `packages/erp-port/AGENTS.md`, `packages/erp-fake/AGENTS.md`. Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
