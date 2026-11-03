/**
 * Personal data check (architecture section 9, ADR-0011, TD-09).
 * Every column of every table in packages/core carries metadata. A personal column has a
 * category, a purpose, an owner and a retention. Exit code 1 on any error.
 */
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getTableColumns, is, Table } from "drizzle-orm";
import { dataMetaOf } from "../../packages/core/src/kernel/data-meta";

/** Column names that are personal data in any table. */
const PERSONAL_NAME =
  /(e-?mail|phone|mobile|given_?name|family_?name|first_?name|last_?name|birth|address|street|postcode|zip|city|iban|bic|ip_?address|date_of_birth|dob)/i;

const coreDir = resolve(import.meta.dirname, "../../packages/core/src");
const errors: string[] = [];
let tableCount = 0;

for (const module of readdirSync(coreDir)) {
  const schemaFile = join(coreDir, module, "schema.ts");
  if (!existsSync(schemaFile)) continue;
  const exports = await import(pathToFileURL(schemaFile).href);
  for (const [exportName, value] of Object.entries(exports)) {
    if (!is(value, Table)) continue;
    tableCount++;
    const where = `${module}/schema.ts ${exportName}`;
    const meta = dataMetaOf(value);
    if (!meta) {
      errors.push(`${where}: table has no data metadata. Wrap it in withDataMeta().`);
      continue;
    }
    for (const [key, column] of Object.entries(getTableColumns(value))) {
      const m = meta[key];
      if (!m) {
        errors.push(`${where}.${key}: column has no metadata.`);
        continue;
      }
      if (m.personal) {
        for (const field of ["purpose", "owner", "retention"] as const) {
          if (!m[field]?.trim()) errors.push(`${where}.${key}: personal column has no ${field}.`);
        }
      } else if (PERSONAL_NAME.test(key) || PERSONAL_NAME.test(column.name)) {
        errors.push(
          `${where}.${key}: the name shows personal data, but the metadata says personal: false.`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Personal data check failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Personal data check passed: ${tableCount} tables.`);
