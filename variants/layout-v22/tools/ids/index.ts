/**
 * Discovery IDs: the register, the references to it, and the impact of a change.
 *   pnpm ids                         check every reference (CI)
 *   pnpm ids show <ID> [<ID> ...]    the text, type, release and owner of IDs
 *   pnpm ids impact <ID> [<ID> ...]  every spec, test, ADR, module file and change record that cites the IDs
 *   pnpm ids diff <v1> <v2>          the difference between two register versions, as Markdown
 *   pnpm ids export <dir> --version <v> --commit <sha>   build docs/requirements/ids.<v>.json
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  checkRefs,
  diffRegisters,
  KINDS,
  loadRegister,
  ownership,
  parseDiscovery,
  type Register,
  scanRefs,
} from "./lib";

const root = resolve(import.meta.dirname, "../..");
const [command = "check", ...rest] = process.argv.slice(2);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

switch (command) {
  case "check": {
    const register = loadRegister(root);
    const refs = scanRefs(root);
    const { errors, warnings } = checkRefs(root, register, refs);
    for (const w of warnings) console.warn(`warning: ${w}`);
    if (errors.length)
      fail(`ID check failed (${errors.length}):\n${errors.map((e) => `  - ${e}`).join("\n")}`);
    console.log(
      `ID check passed: ${refs.length} references to ${new Set(refs.map((r) => r.id)).size} IDs, register v${register.version}.`,
    );
    break;
  }
  case "show": {
    const register = loadRegister(root);
    const owners = ownership(root);
    for (const id of rest) {
      const item = register.items.find((i) => i.id === id);
      if (!item) {
        console.log(`${id}: NOT IN REGISTER v${register.version}`);
        continue;
      }
      console.log(
        `${item.id} (${KINDS[item.type]}${item.release ? `, ${item.release}` : ""}, ${item.status}${item.supersededBy ? ` → ${item.supersededBy}` : ""})`,
      );
      console.log(`  ${item.title}`);
      console.log(`  Source: ${register.source.path}/${item.source} @ ${register.source.commit}`);
      console.log(
        `  Owner: ${owners.get(id)?.join(", ") ?? "no module (cross-cutting, or not assigned yet)"}`,
      );
    }
    break;
  }
  case "impact": {
    if (!rest.length) fail("Usage: pnpm ids impact <ID> [<ID> ...]");
    const refs = scanRefs(root).filter((r) => rest.includes(r.id));
    if (!refs.length) console.log(`No reference to ${rest.join(", ")}.`);
    for (const kind of ["spec", "test", "module", "adr", "change", "code", "doc"] as const) {
      const list = refs.filter((r) => r.kind === kind);
      if (!list.length) continue;
      console.log(`\n${kind} (${list.length})`);
      for (const r of list) console.log(`  ${r.file}:${r.line}  ${r.id}  ${r.text}`);
    }
    break;
  }
  case "diff": {
    const [a, b] = rest;
    if (!a || !b) fail("Usage: pnpm ids diff <v1> <v2>");
    const d = diffRegisters(loadRegister(root, a), loadRegister(root, b));
    console.log(
      `# Register v${a} → v${b}\n\nAdded ${d.added.length}, changed ${d.changed.length}, removed ${d.removed.length}.\n`,
    );
    console.log("| ID | Change | Before | After |\n|---|---|---|---|");
    for (const i of d.added) console.log(`| ${i.id} | added | | ${i.title} |`);
    for (const c of d.changed)
      console.log(
        `| ${c.after.id} | ${c.fields.join(", ")} | ${c.before.title} | ${c.after.title} |`,
      );
    for (const i of d.removed)
      console.log(
        `| ${i.id} | **removed: IDs are never removed, mark it superseded** | ${i.title} | |`,
      );
    if (d.removed.length) process.exitCode = 1;
    break;
  }
  case "export": {
    const [dir] = rest;
    const opt = (name: string) => rest[rest.indexOf(`--${name}`) + 1];
    if (!dir || !rest.includes("--version") || !rest.includes("--commit")) {
      fail("Usage: pnpm ids export <discovery outputs dir> --version <v> --commit <sha>");
    }
    const abs = resolve(dir);
    const files = readdirSync(abs)
      .filter((f) => f.endsWith(".md"))
      .map((name) => ({ name, text: readFileSync(join(abs, name), "utf8") }));
    const register: Register = {
      version: opt("version") ?? "",
      source: {
        repo: "57blocks/provital-discovery",
        path: "outputs/discovery",
        commit: opt("commit") ?? "",
      },
      items: parseDiscovery(files),
    };
    const out = join(root, "docs/requirements", `ids.v${register.version}.json`);
    writeFileSync(out, `${JSON.stringify(register, null, 2)}\n`);
    console.log(`Wrote ${register.items.length} items to ${out}`);
    break;
  }
  default:
    fail(`Unknown command ${command}. Commands: check, show, impact, diff, export.`);
}
