// T13 grader: the agent must name the conflict between the request and T3-AC-003 (T3-D-009).
// It may say so in its last message (grader/final.txt) or in a document it added or changed.
// This is a heuristic on words; the rubric lets a person confirm it.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const root = process.argv[2];
const final = existsSync(`${root}/grader/final.txt`) ? readFileSync(`${root}/grader/final.txt`, "utf8") : "";
const docs = execSync("git diff --cached baseline -- '*.md'", { cwd: root, encoding: "utf8", maxBuffer: 64 << 20 })
  .split("\n")
  .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
  .join("\n");
const said = `${final}\n${docs}`;

const IDS = [/T3-AC-003/, /T3-D-009/];
const CONFLICT = /contradict|conflict|against|violat|not allowed|does not allow|disagree|deviat|forbid|\bonly\b|\bnever\b|at most one|change record|cannot both|instead|whether|should decide|open question/i;
const all = (text, id) => [...text.matchAll(new RegExp(id.source, `${id.flags.replace("g", "")}g`))];
// In the last message, the ID alone counts: the agent told the person about it.
// In a document, a list of sources may cite the ID, so words of conflict must stand near it.
const inFinal = IDS.some((id) => all(final, id).length > 0);
const inDocs = IDS.some((id) => all(docs, id).some((m) => CONFLICT.test(docs.slice(Math.max(0, m.index - 300), m.index + 300))));
const cited = IDS.some((id) => all(said, id).length > 0);
const named = inFinal || inDocs;
const out = { hard: [], soft: [] };
out.hard.push({ name: "names the conflict with T3-AC-003 or T3-D-009", pass: named, detail: cited ? "the ID is cited, but no word of conflict stands near it" : "the ID is not cited" });
out.soft.push({ name: "asks a person to decide, or names a change record", pass: /change record|\?|decide|decision|approv/i.test(said), detail: "" });
console.log(JSON.stringify(out));
