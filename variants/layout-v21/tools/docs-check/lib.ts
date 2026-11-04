/**
 * Documentation rules that a machine can check. The rules are in rules.json.
 * Pure functions; the CLI is in index.ts.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, matchesGlob, relative, resolve } from "node:path";
import ts from "typescript";

export interface Rules {
  lineLimits: { glob: string; max: number }[];
  living: string[];
  links: string[];
  moduleSections: string[];
}

const SKIP = new Set(["node_modules", ".git", "dist", "coverage"]);

export function markdownFiles(root: string, dir = root, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) markdownFiles(root, abs, out);
    else if (name.endsWith(".md")) out.push(relative(root, abs));
  }
  return out.sort();
}

const matches = (file: string, globs: string[]) => globs.some((g) => matchesGlob(file, g));

export function checkLineLimits(root: string, files: string[], rules: Rules): string[] {
  const errors: string[] = [];
  for (const file of files) {
    const rule = rules.lineLimits.find((r) => matchesGlob(file, r.glob));
    if (!rule) continue;
    const lines = readFileSync(join(root, file), "utf8").trimEnd().split("\n").length;
    if (lines > rule.max) {
      errors.push(
        `${file}: ${lines} lines, the limit is ${rule.max}. Move history to git or a record, and details to the document that owns them.`,
      );
    }
  }
  return errors;
}

export function checkNoChangeLog(root: string, files: string[], rules: Rules): string[] {
  return files
    .filter((f) => matches(f, rules.living))
    .filter((f) => /^#+\s*change ?log\b/im.test(readFileSync(join(root, f), "utf8")))
    .map(
      (f) =>
        `${f}: a living document has no change log. The history is in git, the ADRs and the change records.`,
    );
}

const stripCode = (text: string) => text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

export function checkLinks(root: string, files: string[], rules: Rules): string[] {
  const errors: string[] = [];
  for (const file of files.filter((f) => matches(f, rules.links))) {
    const text = stripCode(readFileSync(join(root, file), "utf8"));
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = m[1] ?? "";
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const path = resolve(root, dirname(file), decodeURI(target.replace(/[#?].*$/, "")));
      if (!existsSync(path)) errors.push(`${file}: broken link ${target}`);
    }
  }
  return errors;
}

export function checkAgentFiles(root: string, files: string[], rules: Rules): string[] {
  const errors: string[] = [];
  for (const file of files.filter((f) => /(^|\/)AGENTS\.md$/.test(f))) {
    const claude = join(root, dirname(file), "CLAUDE.md");
    if (!existsSync(claude) || !readFileSync(claude, "utf8").includes("@AGENTS.md")) {
      errors.push(
        `${join(dirname(file), "CLAUDE.md")}: must exist and contain "@AGENTS.md", so that Claude Code loads ${file} when it works in this folder.`,
      );
    }
    if (!/^packages\/core\/src\/[^/]+\/AGENTS\.md$/.test(file)) continue;
    const text = readFileSync(join(root, file), "utf8");
    for (const section of rules.moduleSections) {
      if (!new RegExp(`^## ${section}\\b`, "m").test(text))
        errors.push(`${file}: the section "## ${section}" is missing.`);
    }
  }
  return errors;
}

/** The section that starts at the heading with the marker, up to the next level-2 heading. */
export function verifiedSection(text: string, marker: string): string | null {
  const start = text.search(new RegExp(`^##[^\\n]*<!-- verified: ${marker} -->`, "m"));
  if (start < 0) return null;
  const rest = text.slice(start);
  const next = rest.slice(3).search(/^## /m);
  return next < 0 ? rest : rest.slice(0, next + 3);
}

/** Names in the first column of the table rows. A member (`.method`, `Type.method`) is not a name. */
export function namesInTable(section: string): string[] {
  const names: string[] = [];
  for (const line of section.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const first = line.split("|")[1] ?? "";
    for (const m of first.matchAll(/`([^`]+)`/g)) {
      const code = m[1] ?? "";
      if (code.startsWith(".") || /^[\w$]+\.[\w$]/.test(code)) continue;
      const name = code.match(/^[A-Za-z_$][\w$]*/)?.[0];
      if (name) names.push(name);
    }
  }
  return names;
}

/** Event rows: | `name` | Emits or Consumes | ... */
export function eventsInTable(section: string): { emits: string[]; consumes: string[] } {
  const out = { emits: [] as string[], consumes: [] as string[] };
  for (const line of section.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    const name = cells[1]?.match(/^`([^`]+)`$/)?.[1];
    if (!name) continue;
    if (/^emits/i.test(cells[2] ?? "")) out.emits.push(name);
    else if (/^consumes/i.test(cells[2] ?? "")) out.consumes.push(name);
  }
  return out;
}

/** Exported names of each entry file, with true for a value (function, class, const) and false for a type. */
export function exportsOf(entries: string[]): Map<string, Map<string, boolean>> {
  const program = ts.createProgram(entries, {
    target: ts.ScriptTarget.ES2023,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const result = new Map<string, Map<string, boolean>>();
  for (const entry of entries) {
    const source = program.getSourceFile(entry);
    const symbol = source && checker.getSymbolAtLocation(source);
    const names = new Map<string, boolean>();
    for (const e of symbol ? checker.getExportsOfModule(symbol) : []) {
      const target = e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
      names.set(e.name, (target.flags & ts.SymbolFlags.Value) !== 0);
    }
    result.set(entry, names);
  }
  return result;
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (SKIP.has(name)) continue;
    if (statSync(abs).isDirectory()) sourceFiles(abs, out);
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(abs);
  }
  return out;
}

/** Event names declared (`DomainEvent<"name", ...>`) and subscribed (`.subscribe("name", ...)`) in a folder. */
export function eventsInCode(dir: string): { emits: string[]; consumes: string[] } {
  const emits = new Set<string>();
  const consumes = new Set<string>();
  for (const file of sourceFiles(dir)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/DomainEvent<\s*["']([^"']+)["']/g)) emits.add(m[1] ?? "");
    for (const m of text.matchAll(/\.subscribe(?:<[^>]*>)?\(\s*["']([^"']+)["']/g))
      consumes.add(m[1] ?? "");
  }
  return { emits: [...emits].sort(), consumes: [...consumes].sort() };
}

function entryOf(root: string, doc: string): string | null {
  for (const candidate of ["index.ts", "src/index.ts"]) {
    const abs = join(root, dirname(doc), candidate);
    if (existsSync(abs)) return abs;
  }
  return null;
}

const missing = (want: string[], have: string[]) => want.filter((n) => !have.includes(n));

export function checkVerifiedSections(root: string, files: string[]): string[] {
  const errors: string[] = [];
  const docs = files.filter((f) => /(^|\/)AGENTS\.md$/.test(f) && f !== "AGENTS.md");
  const withExports = docs.filter((d) =>
    verifiedSection(readFileSync(join(root, d), "utf8"), "exports"),
  );
  const entries = withExports.map((d) => entryOf(root, d)).filter((e): e is string => e !== null);
  const exported = exportsOf(entries);
  for (const doc of docs) {
    const text = readFileSync(join(root, doc), "utf8");
    const api = verifiedSection(text, "exports");
    if (api) {
      const entry = entryOf(root, doc);
      if (!entry) {
        errors.push(`${doc}: the Public API section is verified, but there is no index.ts.`);
      } else {
        const names = exported.get(entry) ?? new Map<string, boolean>();
        const listed = namesInTable(api);
        for (const n of missing(listed, [...names.keys()])) {
          errors.push(
            `${doc}: Public API lists \`${n}\`, but ${relative(root, entry)} does not export it.`,
          );
        }
        const values = [...names].filter(([, isValue]) => isValue).map(([n]) => n);
        for (const n of missing(values, listed)) {
          errors.push(
            `${doc}: ${relative(root, entry)} exports \`${n}\`, but the Public API table does not list it.`,
          );
        }
      }
    }
    const events = verifiedSection(text, "events");
    if (events) {
      const listed = eventsInTable(events);
      const code = eventsInCode(join(root, dirname(doc)));
      for (const dir of ["emits", "consumes"] as const) {
        for (const n of missing(code[dir], listed[dir]))
          errors.push(`${doc}: the code ${dir} \`${n}\`, but the Events table does not list it.`);
        for (const n of missing(listed[dir], code[dir]))
          errors.push(
            `${doc}: the Events table says the module ${dir} \`${n}\`, but the code does not.`,
          );
      }
    }
  }
  return errors;
}
