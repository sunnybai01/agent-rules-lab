# Module `integration`

The only module that reaches the ERP (T3-D-005). See [ERP conventions](../../../../docs/conventions/erp.md).

## Owns

The outbox, the read copies (`erp_copy`), reconciliation, the message log, the ERP port client.

## Public API (`index.ts`) <!-- verified: exports -->

| Export | Use |
|---|---|
| `createIntegration({ erp, clock })` | Builds the module service. `erp` is an `ErpPort` adapter, injected by the worker |
| `Integration.readCustomer(customerNumber)` | Customer master data as `ErpRead<CustomerMasterData>` or `null` |
| `Integration`, `IntegrationDeps` | Types of the service |
| `ErpRead<T>` | Data plus `source`, `sourceVersion`, `readAt` (T2-D-009) |

## Events <!-- verified: events -->

None yet.

## Invariants

- Every read records its source, source version and read time.
- No other module imports `@provital/erp-port`.

## Acceptance criteria

T3-AC-001.
