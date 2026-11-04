# AN-902: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. ADR-0017 (written with the spec, Status `Proposed`) is accepted together with the spec. No code before the approval (files: `docs/adr/0017-erp-read-advisor.md`, `docs/adr/README.md`)
- [ ] 2. Test: the fake ERP returns a copy of advisor `B20001`, `null` for an unknown number, and throws `ErpUnavailableError` when unavailable → add `AdvisorMasterData` and `ErpPort.readAdvisor` to the port; add `fakeAdvisors` and `readAdvisor` to the fake (files: `packages/erp-port/src/index.ts`, `packages/erp-fake/src/index.ts`, `packages/erp-fake/src/erp-fake.test.ts`)
- [ ] 3. Test: `integration.readAdvisor("B20001")` returns `ErpRead` with `source`, `sourceVersion`, `readAt` from the clock; `null` for an unknown advisor → add `readAdvisor` to `Integration` (files: `packages/core/src/integration/index.ts`, `packages/core/src/integration/integration.test.ts`)
- [ ] 4. Test: `identity.getAdvisor("B20001")` returns `{ advisorNumber, givenName, familyName, email, active, sourceVersion, readAt }`; `null` for an unknown advisor; passes on `ErpUnavailableError`. Use a stub `Integration` (identity tests may not load `erp-fake`) → add `integration` to `IdentityDeps`, `getAdvisor` and the `Advisor` type; export `Advisor` (files: `packages/core/src/identity/service.ts`, `packages/core/src/identity/index.ts`, `packages/core/src/identity/identity.test.ts`)
- [ ] 5. Test: `createApp().identity.getAdvisor("B20001")` returns the fake advisor; `null` for `B99999` → pass `integrationApi` into `createIdentity` (files: `apps/worker/src/index.ts`, `apps/worker/src/worker.test.ts`)
- [ ] 6. Update `packages/core/src/identity/AGENTS.md`, `packages/core/src/integration/AGENTS.md`, `packages/erp-port/AGENTS.md`, `packages/erp-fake/AGENTS.md`, `apps/worker/AGENTS.md`. Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
