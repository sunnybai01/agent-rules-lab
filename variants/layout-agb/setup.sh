#!/usr/bin/env bash
# Installs AGB (57blocks/agb) into the workspace with AGB's own installer, the way a team would.
# Needs a checkout of agb with `pnpm install` done, at $AGB_DIR or next to the lab (../agb).
# The harness runs this after `git init` and before the baseline commit, so the files the
# installer writes (.abrc.json, .gitignore, the AGENTS.md language section, .git/hooks) are
# part of the baseline, not of the agent's diff. Skills: the harness loads the built plugin with
# --plugin-dir. Knowledge: the harness starts .ab/bin/ab-knowledge-mcp (lab.json).
set -euo pipefail
WS="$1"
AGB="${AGB_DIR:-$(cd "$(dirname "$0")/../.." && pwd)/../agb}"
[ -x "$AGB/node_modules/.bin/tsx" ] || { echo "agb is not installed at $AGB (clone 57blocks/agb, then pnpm install)" >&2; exit 1; }
"$AGB/scripts/install.sh" --project="$WS" --lang=en --host=none --mcp=none --no-commit --no-tips
# The fixture is an existing system: the manual says to set brownfield, so the gate looks at the change only.
node -e '
  const fs = require("node:fs");
  const p = process.argv[1];
  const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
  cfg.mode = "brownfield";
  fs.writeFileSync(p, `${JSON.stringify(cfg, null, 2)}\n`);
' "$WS/.abrc.json"
# `agb init` writes .claude/settings.local.json (a blanket Bash allowance for `agb run`). The harness
# does not load local settings and sets its own allowlist; the file is gitignored but fails the
# fixture's Biome format check, so it would fail every run for a reason that is not the agent's.
rm -f "$WS/.claude/settings.local.json"
