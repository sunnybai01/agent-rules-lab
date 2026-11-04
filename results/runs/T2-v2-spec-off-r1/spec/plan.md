# AN-902: plan

Each step is small and ends with passing tests. Mark a step `[x]` when it is done, in the same commit.

- [ ] 1. Test: the fake ERP returns `B20001`, returns `null` for an unknown advisor, throws `ErpUnavailableError` when `unavailable` → add `AdvisorMasterData` and `ErpPort.readAdvisor`; add `fakeAdvisors` and `readAdvisor` (files: `packages/erp-port/src/index.ts`, `packages/erp-fake/src/index.ts`, `packages/erp-fake/src/erp-fake.test.ts`)
- [ ] 2. Test: `Integration.readAdvisor` returns `ErpRead<AdvisorMasterData>` with `source`, `sourceVersion`, `readAt` from the clock, and `null` for an unknown advisor → implement it (files: `packages/core/src/integration/index.ts`, `packages/core/src/integration/integration.test.ts`)
- [ ] 3. Test: `identity.getAdvisor` returns the flat `Advisor` shape, `null` for an unknown advisor, and the answers to open questions 2 and 3 → add the `integration` dependency and `getAdvisor`; export `Advisor` (files: `packages/core/src/identity/service.ts`, `packages/core/src/identity/index.ts`, `packages/core/src/identity/identity.test.ts`)
- [ ] 4. Test: `createApp().identity.getAdvisor("B20001")` returns the seed advisor → pass `integration` into `createIdentity` (files: `apps/worker/src/index.ts`, `apps/worker/src/worker.test.ts`)
- [ ] 5. Update `identity/AGENTS.md`, `integration/AGENTS.md`, `erp-port/AGENTS.md`, `erp-fake/AGENTS.md` (new exports, dependency, invariant). Set ADR-0017 in the index. Run `/review`, then `pnpm check`.

## Handoff

Empty while one session works. `/handoff` writes here: the last finished step, the state of the next step, the next command.
