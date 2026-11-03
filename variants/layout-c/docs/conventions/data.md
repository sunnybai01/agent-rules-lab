# Data conventions

Source: [architecture.md section 5](../architecture.md#5-data), ADR-0011, TD-09.

## Tables

- Each module owns one PostgreSQL schema. Define tables in `packages/core/src/<module>/schema.ts` with Drizzle.
- A module never reads another module's tables. Use the other module's public API.
- **Every table is wrapped in `withDataMeta(table, meta)`** from `kernel`. `meta` has one entry per column.
- A column that is not personal data: `notPersonal`.
- A personal data column:

  ```ts
  phone: {
    personal: true,
    category: "contact",           // contact | identity | preference | financial | health | other
    purpose: "Contact about an order",            // why the platform keeps it
    owner: "identity",             // the module that owns it
    retention: "account lifetime + 3 years",          // how long the platform keeps it
  },
  ```

- Personal data is any value that identifies a person or is about a person: names, e-mail, phone, address, date of birth, bank details, IP address, consent choices.
- `pnpm pii` fails when a column has no metadata, when a personal column has an empty purpose, owner or retention, or when a column name shows personal data but the metadata says `personal: false`.
- Default retention for account data: `account lifetime + 3 years`. Consent records: `account lifetime + 3 years` (proof of consent).

## Values

- **Money** is an integer in minor units with a currency: `kernel.money(amountMinor)`. Never a float.
- **Time** is stored in UTC as an ISO string. A business date uses the `Europe/Berlin` calendar: `kernel.businessDate(instant)`.
- **IDs** are UUIDv7: `kernel.newId(now)`. ERP keys (customer number `K123456`, advisor number `B12345`) are separate columns.
- **Brand**: entities that a second brand would split have a `brand` column (T3-D-013).
