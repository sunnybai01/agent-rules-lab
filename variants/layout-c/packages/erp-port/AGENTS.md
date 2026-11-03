# Package `erp-port`

The ERP port: operations and payload contracts (Zod). No I/O (ADR-0004, TD-15).

- Each operation has a Zod schema for its payload and a method on `ErpPort`.
- Only `packages/core/src/integration` imports this package. Adapters (`erp-fake`, later `erp-nav`, `erp-bc`) implement it.
- A contract change is visible in review. Do not remove or rename a field without an ADR.
- Keys: customer number `K` + 6 digits, advisor number `B` + 5 digits.
