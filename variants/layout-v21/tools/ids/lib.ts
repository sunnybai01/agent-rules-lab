/**
 * Discovery ID register and reference scanner. Pure functions; the CLI is in index.ts.
 * The register (docs/requirements/ids.<version>.json) is exported from the Discovery package.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

export const ID_PATTERN = /\b[A-Z]+\d*-(?:AC|D|C|P|O|R)-\d{3}\b/g;

export const KINDS: Record<string, string> = {
  AC: "acceptance criterion",
  D: "decision",
  C: "capability",
  P: "input",
  O: "decision with an alternative",
  R: "requirement",
};

export interface Item {
  id: string;
  type: string;
  area: string;
  title: string;
  release?: string;
  source: string;
  status: "active" | "superseded" | "withdrawn";
  supersededBy?: string;
}

export interface Register {
  version: string;
  source: { repo: string; path: string; commit: string };
  items: Item[];
}

export type RefKind = "test" | "spec" | "adr" | "change" | "module" | "code" | "doc";

export interface Ref {
  id: string;
  file: string;
  line: number;
  kind: RefKind;
  text: string;
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

const clean = (s: string) =>
  s
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

function shorten(s: string, max = 300): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))} …`;
}

/** Reads the items from the Markdown files of the Discovery package (table rows that start with an ID). */
export function parseDiscovery(files: { name: string; text: string }[]): Item[] {
  const found = new Map<string, Item>();
  for (const { name, text } of files) {
    const lines = text.split("\n");
    let header: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      if (!line.trim().startsWith("|")) {
        header = [];
        continue;
      }
      if (/^\|?\s*:?-{3,}/.test(line.trim())) continue;
      const row = cells(line);
      const first = clean(row[0] ?? "");
      const match = first.match(/^([A-Z]+\d*)-(AC|D|C|P|O|R)-\d{3}$/);
      if (!match) {
        if (/^\|?\s*:?-{3,}/.test((lines[i + 1] ?? "").trim()))
          header = row.map((h) => clean(h).toLowerCase());
        continue;
      }
      const [, area = "", type = ""] = match;
      const releaseCol = header.indexOf("release");
      const item: Item = {
        id: first,
        type,
        area,
        title: shorten(clean(row[1] ?? "")),
        source: `${name}:${i + 1}`,
        status: "active",
      };
      if (releaseCol > 0 && row[releaseCol]) item.release = clean(row[releaseCol]);
      const existing = found.get(first);
      // An ID can appear in its annex and again in a register (RG). The annex of its area wins.
      if (!existing || (!existing.source.startsWith(area) && name.startsWith(area)))
        found.set(first, item);
    }
  }
  return [...found.values()].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
}

export function loadRegister(root: string, version?: string): Register {
  const dir = join(root, "docs/requirements");
  const v = version ?? JSON.parse(readFileSync(join(dir, "current.json"), "utf8")).version;
  return JSON.parse(readFileSync(join(dir, `ids.v${v}.json`), "utf8"));
}

const SCAN_ROOTS = ["AGENTS.md", "CLAUDE.md", "docs", "packages", "apps"];
const SKIP_DIRS = new Set(["node_modules", "dist", "coverage", ".git", "requirements"]);

function walk(path: string, out: string[]): void {
  if (!existsSync(path)) return;
  if (statSync(path).isDirectory()) {
    if (SKIP_DIRS.has(basename(path))) return;
    for (const name of readdirSync(path)) walk(join(path, name), out);
  } else if (/\.(md|ts|tsx|json)$/.test(path)) out.push(path);
}

export function kindOf(file: string): RefKind {
  if (/\.test\.tsx?$/.test(file)) return "test";
  if (/^docs\/specs\/(?!_template\/)[^/]+\/(spec|plan)\.md$/.test(file)) return "spec";
  if (file.startsWith("docs/adr/")) return "adr";
  if (file.startsWith("docs/changes/")) return "change";
  if (/(^|\/)AGENTS\.md$/.test(file) && file !== "AGENTS.md") return "module";
  if (/\.tsx?$/.test(file)) return "code";
  return "doc";
}

export function scanRefs(root: string): Ref[] {
  const files: string[] = [];
  for (const r of SCAN_ROOTS) walk(join(root, r), files);
  const refs: Ref[] = [];
  for (const abs of files) {
    const file = relative(root, abs);
    const lines = readFileSync(abs, "utf8").split("\n");
    lines.forEach((text, i) => {
      for (const m of text.matchAll(ID_PATTERN)) {
        refs.push({
          id: m[0],
          file,
          line: i + 1,
          kind: kindOf(file),
          text: text.trim().slice(0, 160),
        });
      }
    });
  }
  return refs;
}

/** The status line of a spec: `- **Status:** Draft | Approved | Done | Stale`. */
export function specField(text: string, field: string): string | null {
  return text.match(new RegExp(`\\*\\*${field}:\\*\\*[ \\t]*([^\\n]*)`))?.[1]?.trim() || null;
}

/** AC IDs listed in the "Acceptance criteria" section of each module AGENTS.md. */
export function ownership(root: string): Map<string, string[]> {
  const owners = new Map<string, string[]>();
  const dir = join(root, "packages/core/src");
  if (!existsSync(dir)) return owners;
  for (const module of readdirSync(dir)) {
    const doc = join(dir, module, "AGENTS.md");
    if (!existsSync(doc)) continue;
    const section =
      readFileSync(doc, "utf8").match(
        /^## Acceptance criteria\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m,
      )?.[1] ?? "";
    for (const m of section.matchAll(ID_PATTERN)) {
      const list = owners.get(m[0]) ?? [];
      if (!list.includes(module)) list.push(module);
      owners.set(m[0], list);
    }
  }
  return owners;
}

export interface CheckResult {
  errors: string[];
  warnings: string[];
}

export function checkRefs(root: string, register: Register, refs: Ref[]): CheckResult {
  const byId = new Map(register.items.map((i) => [i.id, i]));
  const errors: string[] = [];
  const warnings: string[] = [];
  const specStatus = new Map<string, string>();
  for (const ref of refs) {
    const where = `${ref.file}:${ref.line}`;
    const item = byId.get(ref.id);
    if (!item) {
      errors.push(
        `${where}: ${ref.id} is not in the Discovery register v${register.version}. Do not invent IDs; run \`pnpm ids show <ID>\`.`,
      );
      continue;
    }
    if (item.status === "active") continue;
    const next = item.supersededBy ? ` Use ${item.supersededBy}.` : "";
    let status = "";
    if (ref.kind === "spec") {
      const specFile = join(root, ref.file.replace(/plan\.md$/, "spec.md"));
      if (!specStatus.has(specFile)) {
        specStatus.set(
          specFile,
          existsSync(specFile) ? (specField(readFileSync(specFile, "utf8"), "Status") ?? "") : "",
        );
      }
      status = specStatus.get(specFile) ?? "";
    }
    const msg = `${where}: ${ref.id} is ${item.status} in v${register.version}.${next}`;
    if (
      ref.kind === "test" ||
      (ref.kind === "spec" && !/^Done/.test(status)) ||
      ref.kind === "module"
    ) {
      errors.push(
        ref.kind === "spec"
          ? `${msg} The spec is stale: set Status to Stale and get it approved again.`
          : msg,
      );
    } else warnings.push(msg);
  }
  for (const [id, modules] of ownership(root)) {
    const item = byId.get(id);
    if (item && item.type !== "AC")
      errors.push(
        `${id}: only AC IDs go in the "Acceptance criteria" section of a module (found in ${modules.join(", ")}).`,
      );
    if (modules.length > 1)
      errors.push(
        `${id}: owned by more than one module (${modules.join(", ")}). One module owns an AC.`,
      );
  }
  return { errors, warnings };
}

export interface RegisterDiff {
  added: Item[];
  removed: Item[];
  changed: { before: Item; after: Item; fields: string[] }[];
}

export function diffRegisters(a: Register, b: Register): RegisterDiff {
  const before = new Map(a.items.map((i) => [i.id, i]));
  const after = new Map(b.items.map((i) => [i.id, i]));
  const diff: RegisterDiff = { added: [], removed: [], changed: [] };
  for (const [id, item] of after) {
    const old = before.get(id);
    if (!old) {
      diff.added.push(item);
      continue;
    }
    const fields = (["title", "release", "status", "supersededBy"] as const).filter(
      (f) => (old[f] ?? "") !== (item[f] ?? ""),
    );
    if (fields.length) diff.changed.push({ before: old, after: item, fields });
  }
  for (const [id, item] of before) if (!after.has(id)) diff.removed.push(item);
  return diff;
}
