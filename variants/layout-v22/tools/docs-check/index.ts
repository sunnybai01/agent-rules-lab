/**
 * Documentation check (docs/engineering/ai-development.md section "Checks").
 * Line limits, no change log in living documents, links, one CLAUDE.md per AGENTS.md,
 * module sections, and the verified Public API and Events tables. Exit code 1 on any error.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  checkAgentFiles,
  checkLineLimits,
  checkLinks,
  checkNoChangeLog,
  checkVerifiedSections,
  markdownFiles,
  type Rules,
} from "./lib";

const root = resolve(import.meta.dirname, "../..");
const rules: Rules = JSON.parse(readFileSync(join(import.meta.dirname, "rules.json"), "utf8"));
const files = markdownFiles(root);
const errors = [
  ...checkLineLimits(root, files, rules),
  ...checkNoChangeLog(root, files, rules),
  ...checkLinks(root, files, rules),
  ...checkAgentFiles(root, files, rules),
  ...checkVerifiedSections(root, files),
];
if (errors.length) {
  console.error(`Documentation check failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Documentation check passed: ${files.length} Markdown files.`);
