import type { Table } from "drizzle-orm";

export type PersonalDataCategory =
  | "contact"
  | "identity"
  | "preference"
  | "financial"
  | "health"
  | "other";

/** Metadata for one column (ADR-0011, TD-09). Every column carries it. */
export type ColumnMeta =
  | { readonly personal: false }
  | {
      readonly personal: true;
      readonly category: PersonalDataCategory;
      /** Why the platform keeps it. */
      readonly purpose: string;
      /** The module that owns it. */
      readonly owner: string;
      /** How long the platform keeps it, for example "account lifetime + 3 years". */
      readonly retention: string;
    };

export const notPersonal: ColumnMeta = { personal: false };

type ColumnsOf<T extends Table> = T["_"]["columns"];

const registry = new Map<Table, Record<string, ColumnMeta>>();

/** Registers the metadata of every column of a table. The personal data check reads it. */
export function withDataMeta<T extends Table>(
  table: T,
  meta: { [K in keyof ColumnsOf<T>]: ColumnMeta },
): T {
  registry.set(table, meta as Record<string, ColumnMeta>);
  return table;
}

export function dataMetaOf(table: Table): Record<string, ColumnMeta> | undefined {
  return registry.get(table);
}
