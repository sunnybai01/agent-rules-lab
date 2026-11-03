#!/usr/bin/env node
// Builds variants/layout-b from variants/layout-c: the same facts, in one root AGENTS.md.
// Run after each change to layout-c: node harness/build-layout-b.mjs
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const variants = resolve(import.meta.dirname, "../variants");
const c = join(variants, "layout-c");
const b = join(variants, "layout-b");

// Order of the sections in the merged file. [file in layout-c, anchor, heading level shift]
const parts = [
  ["docs/README.md", "document-map"],
  ["docs/conventions/data.md", "data-conventions"],
  ["docs/conventions/events.md", "event-conventions"],
  ["docs/conventions/erp.md", "erp-access-conventions"],
  ["docs/conventions/testing.md", "test-conventions"],
  ["packages/core/src/kernel/AGENTS.md", "module-kernel"],
  ["packages/core/src/identity/AGENTS.md", "module-identity"],
  ["packages/core/src/journey/AGENTS.md", "module-journey"],
  ["packages/core/src/integration/AGENTS.md", "module-integration"],
  ["packages/erp-port/AGENTS.md", "package-erp-port"],
  ["packages/erp-fake/AGENTS.md", "package-erp-fake"],
  ["apps/worker/AGENTS.md", "app-worker"],
  ["docs/jira.md", "jira"],
];

const anchorOf = new Map(parts.map(([file, anchor]) => [file.split("/").slice(-2).join("/"), anchor]));

/** Rewrites links to merged files as in-page anchors; keeps links to docs that stay files. */
function relink(text, fromFile) {
  return text.replace(/\]\(([^)#]+?)(#[^)]*)?\)/g, (whole, target) => {
    if (/^https?:/.test(target)) return whole;
    const abs = join(fromFile, "..", target).replace(/\\/g, "/");
    const key = abs.split("/").slice(-2).join("/");
    if (anchorOf.has(key)) return `](#${anchorOf.get(key)})`;
    if (key.endsWith("AGENTS.md")) return "](#agent-instructions)";
    // A document that stays a file: link relative to the repository root.
    return `](${abs.replace(/^\.\//, "")})`;
  });
}

function demote(text) {
  return text.replace(/^(#+) /gm, "#$1 ");
}

let root = readFileSync(join(c, "AGENTS.md"), "utf8");
root = root
  .replace("Read [docs/README.md](docs/README.md) for the document map.", "This file holds all agent guidance. The other documents are listed in the document map below.")
  .replace(/^- Read the `AGENTS.md` of each module you change\..*\n/m, "- Read the section of each module you change below. It lists the public API, the events and the invariants.\n")
  .replace("The module `AGENTS.md` shows", "The module section in this file shows")
  .replace(/^Jira rules: .*\n/m, "");
root = relink(root, "AGENTS.md");

let merged = `${root.trimEnd()}\n`;
for (const [file, anchor] of parts) {
  let body = readFileSync(join(c, file), "utf8");
  body = relink(body, file);
  body = demote(body).replace(/^## (.*)$/m, (_, title) => `## ${title} <a id="${anchor}"></a>`);
  merged += `\n${body.trimEnd()}\n`;
}
merged = merged
  .replace(/`packages\/core\/src\/<module>\/AGENTS\.md`/g, "Module sections in AGENTS.md")
  .replace("](docs/conventions/)", "](#data-conventions)")
  .replace(/updates the module `AGENTS\.md`/g, "updates the module section of AGENTS.md")
  .replace(/List each event in the `AGENTS\.md` of/g, "List each event in the AGENTS.md section of");

rmSync(b, { recursive: true, force: true });
mkdirSync(join(b, "docs"), { recursive: true });
cpSync(join(c, "docs/adr"), join(b, "docs/adr"), { recursive: true });
writeFileSync(join(b, "AGENTS.md"), merged);
writeFileSync(join(b, "CLAUDE.md"), "@AGENTS.md\n");
console.log(`layout-b/AGENTS.md: ${merged.split("\n").length} lines`);
