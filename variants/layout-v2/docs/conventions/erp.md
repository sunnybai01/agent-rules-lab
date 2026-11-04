# ERP access conventions

Source: T3-D-005 (fixed), T3-AC-001, ADR-0004, TD-15.

- **Only the `integration` module uses the ERP port** (`@provital/erp-port`). Other modules call the `integration` public API. `pnpm arch` fails otherwise.
- **Only `apps/worker` (and later `apps/integration-gateway`) loads an adapter** (`@provital/erp-fake`, later `erp-nav`, `erp-bc`). Tests of `integration` may use `erp-fake`.
- To add an ERP read:
  1. Add the payload contract as a Zod schema and the operation to `ErpPort` in `packages/erp-port/src/index.ts`.
  2. Implement it in `packages/erp-fake/src/index.ts` with synthetic seed data. Support `unavailable`.
  3. Add a function to the `Integration` interface in `packages/core/src/integration/index.ts`. Return an `ErpRead<T>`: the data plus `source`, `sourceVersion` and `readAt` (T2-D-009).
  4. The module that needs the data receives `Integration` as a dependency and calls it. Wire it in `apps/worker/src/index.ts`.
- ERP keys: customer number `K` + 6 digits, advisor number `B` + 5 digits.
- The ERP can be down. A read throws `ErpUnavailableError`; the caller decides the fallback (T2 section 5).
