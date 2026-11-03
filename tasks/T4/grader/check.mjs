// T4 grader: structure of the new ADR and validity of the cited IDs.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = process.argv[2];
const added = execSync("git diff --cached baseline --name-only --diff-filter=A", { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter((f) => /^docs\/adr\/\d{4}-.+\.md$/.test(f) && !f.includes("0000-template"));
const out = { hard: [], soft: [] };
const add = (kind, name, pass, detail = "") => out[kind].push({ name, pass, detail });

add("hard", "one new ADR in docs/adr/NNNN-*.md", added.length === 1, added.join(", "));
if (added.length >= 1) {
  const adr = readFileSync(`${root}/${added[0]}`, "utf8");
  const corpus = ["discovery-baseline", "technical-decisions", "architecture", "delivery-plan", "infrastructure"]
    .map((d) => readFileSync(`${root}/docs/${d}.md`, "utf8"))
    .join("\n");
  for (const section of ["Context", "Decision", "Consequences"]) {
    add("hard", `has section ${section}`, new RegExp(`^##+\\s+${section}`, "mi").test(adr));
  }
  add("hard", "status Proposed", /Status[^\n]*Proposed/i.test(adr));
  const ids = [...new Set(adr.match(/\b[A-Z]\d-[A-Z]{1,2}-\d{3}\b/g) ?? [])];
  const invented = ids.filter((id) => !corpus.includes(id));
  add("hard", "no invented Discovery IDs", invented.length === 0, invented.join(", "));
  add("soft", "cites at least two Discovery IDs", ids.length >= 2, ids.join(", "));
  add("soft", "cites TD-09", /TD-09/.test(adr));
  add("soft", "has an Options section", /^##+\s+(Options|Considered options|Alternatives)/mi.test(adr));
  const index = (() => {
    try {
      return readFileSync(`${root}/docs/adr/README.md`, "utf8");
    } catch {
      return "";
    }
  })();
  add("soft", "ADR index lists the new ADR", index.includes(added[0].split("/").pop().slice(0, 4)));
}
console.log(JSON.stringify(out));
