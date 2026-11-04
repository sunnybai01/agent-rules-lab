/**
 * Pull request rules (docs/engineering/ai-development.md section "Pull request").
 * With squash merge the pull request title and body become the commit, so they carry the trace.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const TITLE =
  /^(feat|fix|docs|chore|refactor|test|ci|build|perf)(\([\w-]+\))?!?: .+ \((AN-\d+)\)$/;
const ID = /\b[A-Z]+\d*-(?:AC|D|C|P|O|R)-\d{3}\b/g;

export interface PullRequest {
  title: string;
  body: string;
  /** GitHub login of the author. */
  author: string;
}

export interface PrCheckDeps {
  root: string;
  /** Returns the AC IDs that have no test whose title starts with the ID. */
  untested: (ids: string[]) => string[];
}

/** The text after `Name:` on one line, or the body of the `## Name` section. */
export function field(body: string, name: string): string | null {
  const line = body.match(new RegExp(`^${name}:[ \\t]*(.*)$`, "m"));
  if (line) return (line[1] ?? "").trim();
  const section = body.match(
    new RegExp(`^## ${name}[^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m"),
  );
  return section ? (section[1] ?? "").replace(/<!--[\s\S]*?-->/g, "").trim() : null;
}

const specField = (text: string, name: string) =>
  text.match(new RegExp(`\\*\\*${name}:\\*\\*[ \\t]*([^\\n]*)`))?.[1]?.trim() ?? "";

/** AC IDs in the "Acceptance criteria" section of a spec. */
export function specAcs(spec: string): string[] {
  const section =
    spec.match(/^## Acceptance criteria[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] ?? "";
  return [
    ...new Set([...section.matchAll(ID)].map((m) => m[0]).filter((id) => id.includes("-AC-"))),
  ];
}

export function checkPr(pr: PullRequest, deps: PrCheckDeps): string[] {
  const errors: string[] = [];
  const title = pr.title.match(TITLE);
  if (!title) {
    return [
      `Title "${pr.title}" must be "<type>: <imperative summary> (AN-<n>)", for example "feat: record a consent (AN-900)".`,
    ];
  }
  const type = title[1] ?? "";
  const key = title[3] ?? "";

  const refs = field(pr.body, "Refs");
  if (refs !== key) errors.push(`The body needs the line "Refs: ${key}".`);

  const verification = field(pr.body, "Verification") ?? "";
  const evidence = verification
    .split("\n")
    .filter((l) => /^\s*-\s+\S/.test(l) && !/<[^>]+>/.test(l));
  if (!evidence.length)
    errors.push(
      'The "## Verification" section needs at least one line: the command you ran and its result.',
    );
  if (field(pr.body, "Deviations from spec") === null) {
    errors.push(
      'The "## Deviations from spec" section is missing. Write "None." when there is none.',
    );
  }

  const coveredText = field(pr.body, "Covered") ?? "";
  const covered = [...new Set([...coveredText.matchAll(ID)].map((m) => m[0]))];

  const specPath = field(pr.body, "Spec") ?? "";
  const withoutSpec = type === "feat" && (!specPath || /^none\b/i.test(specPath));
  if (withoutSpec) {
    // A normal story on a direct request: the design increment is in the pull request body.
    const increment = (field(pr.body, "Design increment") ?? "")
      .split("\n")
      .filter((l) => /\S/.test(l) && !/<[^>]+>/.test(l));
    if (!increment.length) {
      errors.push(
        `A feat pull request names its spec ("Spec: docs/specs/${key}/spec.md") or, for a normal story, fills the "## Design increment" section.`,
      );
    }
  } else if (type === "feat") {
    const expected = `docs/specs/${key}/spec.md`;
    if (specPath !== expected)
      errors.push(`A feat pull request needs the line "Spec: ${expected}".`);
    const abs = join(deps.root, expected);
    if (!existsSync(abs)) {
      errors.push(`${expected} does not exist. Write it with /story-start.`);
    } else {
      const spec = readFileSync(abs, "utf8");
      const status = specField(spec, "Status");
      if (!/^(Approved|Done)\b/.test(status))
        errors.push(`${expected}: Status is "${status}", it must be Approved or Done.`);
      const gate = specField(spec, "Gate");
      const approvedBy = specField(spec, "Approved-by").split(/\s+/)[0]?.replace(/^@/, "") ?? "";
      if (/^design/.test(gate)) {
        if (!approvedBy)
          errors.push(
            `${expected}: a design story needs "Approved-by: <GitHub login> <date>" before the code.`,
          );
        else if (approvedBy.toLowerCase() === pr.author.toLowerCase()) {
          errors.push(
            `${expected}: a design story is approved by a second person, not by the author (${pr.author}).`,
          );
        }
      }
      const deviations = field(pr.body, "Deviations from spec") ?? "";
      const notCovered = specAcs(spec).filter(
        (id) => !covered.includes(id) && !deviations.includes(id),
      );
      if (notCovered.length) {
        errors.push(
          `The spec lists ${notCovered.join(", ")}, but "Covered:" does not. Cover them, or explain under "Deviations from spec".`,
        );
      }
    }
  }

  if (type === "fix" && !covered.length && !/^none\b/i.test(coveredText)) {
    errors.push('A fix names the AC IDs it restores in "Covered:", or writes "Covered: none".');
  }

  const acs = covered.filter((id) => id.includes("-AC-"));
  const untested = acs.length ? deps.untested(acs) : [];
  if (untested.length) errors.push(`No test title starts with ${untested.join(", ")}.`);
  return errors;
}
