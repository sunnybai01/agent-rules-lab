import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkAgentFiles,
  checkLineLimits,
  checkLinks,
  checkNoChangeLog,
  checkVerifiedSections,
  markdownFiles,
  namesInTable,
  type Rules,
} from "./lib";

const RULES: Rules = {
  lineLimits: [{ glob: "packages/**/AGENTS.md", max: 30 }],
  living: ["packages/**/AGENTS.md"],
  links: ["packages/**/AGENTS.md"],
  moduleSections: ["Owns", "Public API", "Events"],
};

const MODULE_DOC = `# Module \`m\`

## Owns

Things. See [events](../../../../docs/events.md).

## Public API (\`index.ts\`) <!-- verified: exports -->

| Export | Use |
|---|---|
| \`createM({ bus })\` | Builds the service |
| \`.doThing(x)\` | A member, not checked |
| \`Thing\` | A type |

## Events <!-- verified: events -->

| Event | Direction | Payload |
|---|---|---|
| \`m.thing-done\` | Emits | \`thingId\` |
`;

const INDEX = `import type { DomainEvent } from "./events";
export interface Thing { id: string }
export type ThingDone = DomainEvent<"m.thing-done", { thingId: string }>;
export function createM(_: { bus: unknown }) { return { doThing: (x: number) => x }; }
`;

function repo(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "docs-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const base = {
  "packages/core/src/m/AGENTS.md": MODULE_DOC,
  "packages/core/src/m/CLAUDE.md": "@AGENTS.md\n",
  "packages/core/src/m/index.ts": INDEX,
  "packages/core/src/m/events.ts":
    "export interface DomainEvent<T extends string, P> { type: T; payload: P }\n",
  "docs/events.md": "# Events\n",
};

const run = (files: Record<string, string>) => {
  const root = repo(files);
  const md = markdownFiles(root);
  return [
    ...checkLineLimits(root, md, RULES),
    ...checkNoChangeLog(root, md, RULES),
    ...checkLinks(root, md, RULES),
    ...checkAgentFiles(root, md, RULES),
    ...checkVerifiedSections(root, md),
  ];
};

describe("docs check", () => {
  it("passes when the module file agrees with the code", () => {
    expect(run(base)).toEqual([]);
  });

  it("finds a value export that the Public API table does not list, and a listed name that is not exported", () => {
    const errors = run({
      ...base,
      "packages/core/src/m/index.ts": `${INDEX}export const helper = 1;\n`,
      "packages/core/src/m/AGENTS.md": MODULE_DOC.replace(
        "| `Thing` | A type |",
        "| `Gone` | Removed |",
      ),
    });
    expect(errors).toEqual([
      expect.stringContaining("lists `Gone`"),
      expect.stringContaining("exports `helper`"),
    ]);
  });

  it("finds an event in the code that the Events table does not list", () => {
    const errors = run({
      ...base,
      "packages/core/src/m/subscriptions.ts":
        'export const r = (bus: any) => bus.subscribe("x.happened", () => {});\n',
    });
    expect(errors).toEqual([expect.stringContaining("the code consumes `x.happened`")]);
  });

  it("finds a long file, a change log, a broken link, a missing CLAUDE.md and a missing section", () => {
    const doc = `${MODULE_DOC.replace("../../../../docs/events.md", "nowhere.md").replace("## Events", "## Signals")}\n## Change log\n${"x\n".repeat(20)}`;
    const errors = run({
      ...base,
      "packages/core/src/m/AGENTS.md": doc,
      "packages/core/src/m/CLAUDE.md": "",
    });
    expect(errors.join("\n")).toMatch(/lines, the limit is 30/);
    expect(errors.join("\n")).toMatch(/no change log/);
    expect(errors.join("\n")).toMatch(/broken link nowhere.md/);
    expect(errors.join("\n")).toMatch(/CLAUDE.md: must exist/);
    expect(errors.join("\n")).toMatch(/"## Events" is missing/);
  });
});

it("reads names from the first column and skips members", () => {
  expect(
    namesInTable("| `money(a)`, `add` | x |\n| `Integration.read(x)` | y |\n| `.m()` | z |"),
  ).toEqual(["money", "add"]);
});
