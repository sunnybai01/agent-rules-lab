# Data conventions

Source: [architecture.md section 5](../architecture.md#5-data), ADR-0023. The data model is the `schema.ts` of each module.

## Tables

- A module owns one schema.
- A table's comment says what a row is.
- A value list is an enum in the module's schema.
- A reference inside a module is a foreign key. A reference to another module is an ID or an ERP number.
- A read copy lives in the owning module. Only that module writes it (ADR-0023).
- **Soft delete** only where a person removes a row from a list. Reads and unique keys use live rows only.
- Other lifecycles are a status or a date. An erasure deletes or anonymises the row (T3-C-003).
- **Indexes:** the keys, every reference column and the worker queues. Add more with their query, checked with `EXPLAIN`.
- Migrations expand, deploy, then contract. A destructive step needs `-- contract-step: <reason>`.

## Personal data

- Wrap each personal data column in `withDataMeta()` from `kernel` (ADR-0011).
- Personal data is about a person, including an owner's pet and an ERP customer number.
- No placeholder values. Write the retention you expect: a period in words. Do not wait for a confirmation: the data protection officer confirms the whole list once before UAT (T3-O-005).
- A new personal data category is a design change.

## Values

- Money: `<name>Minor` and `<name>Currency`. Time: UTC; a business date uses `Europe/Berlin`.
- IDs: UUIDv7 from `newId()`. `brand` where a second brand would split the data (T3-D-013).
