/**
 * Pull request check. In GitHub Actions it reads the pull request from GITHUB_EVENT_PATH.
 * Locally: pnpm prcheck --title "<title>" --body-file <file> --author <login>
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkPr, type PullRequest } from "./lib";

const root = resolve(import.meta.dirname, "../..");
const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};

function readPr(): PullRequest {
  if (process.env.GITHUB_EVENT_PATH) {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
    const pr = event.pull_request ?? {};
    return { title: pr.title ?? "", body: pr.body ?? "", author: pr.user?.login ?? "" };
  }
  const bodyFile = arg("body-file");
  return {
    title: arg("title") ?? "",
    body: bodyFile ? readFileSync(bodyFile, "utf8") : "",
    author: arg("author") ?? "",
  };
}

function untested(ids: string[]): string[] {
  try {
    execFileSync("pnpm", ["-s", "trace", "--require", ids.join(",")], { cwd: root, stdio: "pipe" });
    return [];
  } catch (error) {
    const out = String((error as { stderr?: Buffer }).stderr ?? "");
    return ids.filter((id) => out.includes(id));
  }
}

const errors = checkPr(readPr(), { root, untested });
if (errors.length) {
  console.error(`Pull request check failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("Pull request check passed.");
