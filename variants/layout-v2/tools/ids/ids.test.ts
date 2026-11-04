import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkRefs, diffRegisters, kindOf, parseDiscovery, type Register, scanRefs } from "./lib";

const ANNEX = `## 3. Decisions

| ID | Decision | Basis |
|---|---|---|
| T3-D-001 | A **modular** monolith | Proposal |

| ID | Capability | Release | Source |
|---|---|---|---|
| T3-C-001 | Pilot switch per advisor | RC | A7 |
| T3-AC-004 | A consent record shows its text version | x |
`;

function register(items: Partial<Register["items"][number]>[]): Register {
  return {
    version: "1.0",
    source: { repo: "r", path: "p", commit: "c" },
    items: items.map((i) => ({
      type: "AC",
      area: "T3",
      title: "t",
      source: "s",
      status: "active",
      id: "",
      ...i,
    })),
  };
}

function repo(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "ids-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

describe("parseDiscovery", () => {
  it("reads the ID rows of each table, with the release column when there is one", () => {
    const items = parseDiscovery([{ name: "T3-annex.md", text: ANNEX }]);
    expect(items.map((i) => i.id)).toEqual(["T3-AC-004", "T3-C-001", "T3-D-001"]);
    expect(items.find((i) => i.id === "T3-C-001")?.release).toBe("RC");
    expect(items.find((i) => i.id === "T3-D-001")).toMatchObject({
      type: "D",
      area: "T3",
      title: "A modular monolith",
    });
  });

  it("prefers the annex of the area over a register that repeats the ID", () => {
    const rg = "| ID | Input |\n|---|---|\n| T3-D-001 | repeated |\n";
    const items = parseDiscovery([
      { name: "RG-registers.md", text: rg },
      { name: "T3-annex.md", text: ANNEX },
    ]);
    expect(items.find((i) => i.id === "T3-D-001")?.source).toBe("T3-annex.md:5");
  });
});

describe("checkRefs", () => {
  it("fails on an ID that is not in the register", () => {
    const root = repo({ "docs/a.md": "See T3-AC-004 and T3-AC-999." });
    const { errors } = checkRefs(root, register([{ id: "T3-AC-004" }]), scanRefs(root));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("docs/a.md:1: T3-AC-999");
  });

  it("fails on a superseded ID in a test or an open spec, and warns in other documents", () => {
    const root = repo({
      "packages/core/src/x/x.test.ts": 'it("T3-AC-004: old", () => {});',
      "docs/specs/AN-1/spec.md": "- **Status:** Approved\n\nT3-AC-004",
      "docs/specs/AN-2/spec.md": "- **Status:** Done\n\nT3-AC-004",
      "docs/changes/CR-001-x.md": "T3-AC-004 → T3-AC-007",
    });
    const reg = register([
      { id: "T3-AC-004", status: "superseded", supersededBy: "T3-AC-007" },
      { id: "T3-AC-007" },
    ]);
    const { errors, warnings } = checkRefs(root, reg, scanRefs(root));
    expect(errors.map((e) => e.split(":")[0]).sort()).toEqual([
      "docs/specs/AN-1/spec.md",
      "packages/core/src/x/x.test.ts",
    ]);
    expect(errors.join("\n")).toContain("stale");
    expect(warnings).toHaveLength(2);
  });

  it("fails when two modules own the same AC", () => {
    const section = "## Acceptance criteria\n\nT3-AC-004.\n\n## Terms\n";
    const root = repo({
      "packages/core/src/a/AGENTS.md": section,
      "packages/core/src/b/AGENTS.md": section,
    });
    const { errors } = checkRefs(root, register([{ id: "T3-AC-004" }]), scanRefs(root));
    expect(errors.some((e) => e.includes("more than one module (a, b)"))).toBe(true);
  });
});

describe("diffRegisters", () => {
  it("lists added, changed and removed items", () => {
    const a = register([{ id: "T3-AC-001" }, { id: "T3-AC-002" }]);
    const b = register([{ id: "T3-AC-001", title: "new" }, { id: "T3-AC-003" }]);
    const d = diffRegisters(a, b);
    expect(d.added.map((i) => i.id)).toEqual(["T3-AC-003"]);
    expect(d.changed[0]?.fields).toEqual(["title"]);
    expect(d.removed.map((i) => i.id)).toEqual(["T3-AC-002"]);
  });
});

it("classifies a reference by its file", () => {
  expect(kindOf("packages/core/src/identity/consent.test.ts")).toBe("test");
  expect(kindOf("docs/specs/AN-9/plan.md")).toBe("spec");
  expect(kindOf("docs/specs/_template/spec.md")).toBe("doc");
  expect(kindOf("packages/core/src/identity/AGENTS.md")).toBe("module");
  expect(kindOf("AGENTS.md")).toBe("doc");
});
