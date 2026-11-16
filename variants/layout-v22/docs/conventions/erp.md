# ERP access conventions

Source: T3-D-005, T3-D-007, [architecture.md sections 3, 4 and 6](../architecture.md#4-modules).

- **Only the `integration` module uses the ERP port** (`@provital/erp-port`). `pnpm arch` fails otherwise.
- **Only `apps/worker` holds the ERP connection and loads an adapter** (`@provital/erp-fake`).
- Reads go to copies (T3-D-007, ADR-0023). Only three checkout reads are synchronous, with a short timeout: payment options, live voucher read, order history ([architecture section 3](../architecture.md#3-runtime-units), T2 section 4). For another one, post `[question @discovery]` and build the rest ([AGENTS.md](../../AGENTS.md#design-changes)).
- To add an ERP operation (ADR-0006, no ADR):
  1. Add the Zod schema, with a `.describe()` per field, to `packages/erp-port/src/index.ts`. Add the operation to `ErpPort`.
  2. Implement it in `packages/erp-fake` with synthetic data.
- The ERP can be down: the caller decides.
