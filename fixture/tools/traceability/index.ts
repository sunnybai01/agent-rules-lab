/**
 * Acceptance criterion coverage (architecture section 9, Definition of done).
 * Lists the AC IDs named in test titles. With --require A,B it fails when an ID is missing.
 *   pnpm trace
 *   pnpm trace --require T3-AC-004
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const AC_ID = /\b[AT]\d-AC-\d{3}\b/g;
const TITLE = /\b(?:it|test|describe)(?:\.\w+)?\(\s*(["'`])(.*?)\1/g;

function testFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...testFiles(path));
    else if (name.endsWith(".test.ts")) out.push(path);
  }
  return out;
}

const coverage = new Map<string, string[]>();
for (const file of [...testFiles(join(root, "packages")), ...testFiles(join(root, "apps"))]) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(TITLE)) {
    for (const id of match[2]?.match(AC_ID) ?? []) {
      const list = coverage.get(id) ?? [];
      list.push(relative(root, file));
      coverage.set(id, list);
    }
  }
}

const requireIndex = process.argv.indexOf("--require");
const required =
  requireIndex > 0 ? (process.argv[requireIndex + 1] ?? "").split(",").filter(Boolean) : [];

for (const [id, files] of [...coverage].sort())
  console.log(`${id}\t${[...new Set(files)].join(", ")}`);
const missing = required.filter((id) => !coverage.has(id));
if (missing.length > 0) {
  console.error(`Missing tests for: ${missing.join(", ")}`);
  process.exit(1);
}
