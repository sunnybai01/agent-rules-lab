# Package `erp-fake`

The fake ERP adapter with synthetic seed data, for development and tests.

- Implement each `ErpPort` operation. Return a copy of the seed data.
- Support `{ unavailable: true }`: every operation throws `ErpUnavailableError`.
- Seed data is invented. Use `@example.test` addresses.
