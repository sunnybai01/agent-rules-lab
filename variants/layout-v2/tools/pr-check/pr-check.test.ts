import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkPr, field, specAcs } from "./lib";

const SPEC = (status: string, gate: string, approvedBy = "") => `# AN-900: Record a consent
- **Jira:** AN-900
- **Gate:** ${gate}
- **Status:** ${status}
- **Approved-by:** ${approvedBy}

## Acceptance criteria

| ID | Test |
|---|---|
| T3-AC-004 | identity/consent.test.ts |

## Design increment
`;

function repo(spec?: string): string {
  const root = mkdtempSync(join(tmpdir(), "pr-"));
  if (spec) {
    mkdirSync(join(root, "docs/specs/AN-900"), { recursive: true });
    writeFileSync(join(root, "docs/specs/AN-900/spec.md"), spec);
  }
  return root;
}

const BODY = `Spec: docs/specs/AN-900/spec.md
Refs: AN-900
Covered: T3-AC-004

## Verification
- \`pnpm check\`: pass

## Deviations from spec
None.
`;

const deps = (root: string, untested: string[] = []) => ({ root, untested: () => untested });
const feat = { title: "feat: record a consent (AN-900)", body: BODY, author: "sunny" };

describe("checkPr", () => {
  it("passes a complete feat pull request", () => {
    expect(checkPr(feat, deps(repo(SPEC("Approved", "normal"))))).toEqual([]);
  });

  it("rejects a title without the type or the Jira key", () => {
    expect(checkPr({ ...feat, title: "record a consent" }, deps(repo()))[0]).toContain("Title");
  });

  it("needs a spec for feat, and an approval by a second person for a design story", () => {
    expect(checkPr(feat, deps(repo())).join()).toContain("does not exist");
    expect(checkPr(feat, deps(repo(SPEC("Draft", "normal")))).join()).toContain("must be Approved");
    expect(checkPr(feat, deps(repo(SPEC("Approved", "design")))).join()).toContain(
      'needs "Approved-by',
    );
    expect(
      checkPr(feat, deps(repo(SPEC("Approved", "design", "@Sunny 2026-11-12")))).join(),
    ).toContain("second person");
    expect(checkPr(feat, deps(repo(SPEC("Approved", "design", "ryan 2026-11-12"))))).toEqual([]);
  });

  it("needs each AC of the spec in Covered, or a deviation that names it", () => {
    const body = BODY.replace("Covered: T3-AC-004", "Covered: none");
    expect(checkPr({ ...feat, body }, deps(repo(SPEC("Approved", "normal")))).join()).toContain(
      "does not",
    );
    const explained = body.replace("None.", "- T3-AC-004 moves to AN-901.");
    expect(checkPr({ ...feat, body: explained }, deps(repo(SPEC("Approved", "normal"))))).toEqual(
      [],
    );
  });

  it("needs evidence under Verification, not the template placeholder", () => {
    const body = BODY.replace("- `pnpm check`: pass", "- <command>: <result>");
    expect(checkPr({ ...feat, body }, deps(repo(SPEC("Approved", "normal")))).join()).toContain(
      "Verification",
    );
  });

  it("fails when a covered AC has no test", () => {
    expect(checkPr(feat, deps(repo(SPEC("Approved", "normal")), ["T3-AC-004"])).join()).toContain(
      "No test",
    );
  });

  it("does not need a spec for a fix, but needs Covered", () => {
    const fix = {
      ...feat,
      title: "fix: keep the consent order (AN-950)",
      body: BODY.replace(/AN-900/g, "AN-950").replace(/^Spec.*\n/, ""),
    };
    expect(checkPr(fix, deps(repo()))).toEqual([]);
    expect(
      checkPr({ ...fix, body: fix.body.replace(/^Covered.*\n/m, "") }, deps(repo())).join(),
    ).toContain("Covered");
  });
});

it("reads a field from a line or from a section", () => {
  expect(field(BODY, "Refs")).toBe("AN-900");
  expect(field(BODY, "Deviations from spec")).toBe("None.");
  expect(field(BODY, "Missing")).toBeNull();
  expect(specAcs(SPEC("Approved", "normal"))).toEqual(["T3-AC-004"]);
});
