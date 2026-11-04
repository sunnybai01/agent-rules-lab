# Package `erp-fake`

The fake ERP adapter with synthetic seed data, for development and tests.

## Public API (`src/index.ts`) <!-- verified: exports -->

| Export | Use |
|---|---|
| `createFakeErp({ unavailable? })` | An `ErpPort` with seed data. With `unavailable: true` every operation throws `ErpUnavailableError` |
| `FakeErpOptions` | Options of `createFakeErp` |
| `fakeCustomers` | The seed customers |

## Rules

- Implement each `ErpPort` operation. Return a copy of the seed data.
- Seed data is invented. Use `@example.test` addresses.
