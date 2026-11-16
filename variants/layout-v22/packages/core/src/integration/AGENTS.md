# Module `integration`

The only module that reaches the ERP (T3-D-005). See [ERP conventions](../../../../docs/conventions/erp.md).

## Owns

The outbox, the read copies (`erp_copy`), reconciliation, the message log, the ERP port client.

## Invariants

- Every read records its source, source version and read time.
- No other module imports `@provital/erp-port`.
