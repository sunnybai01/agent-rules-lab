# Layout

Where a new folder or file goes. The tree itself shows what exists; no document lists it.

| You add | Put it in | With |
|---|---|---|
| A runtime unit | `apps/<unit>/` | `AGENTS.md`, `CLAUDE.md`, `createApp()` in `src/app.ts` and the entry `src/main.ts` (a web app: `src/server/app.ts`, `src/server/entry.ts`). A new unit is a design change |
| A domain module | `packages/core/src/<module>/` | `AGENTS.md` (Owns, Invariants: only what the code cannot show), `CLAUDE.md`, `index.ts`, `schema.ts`. A new module is a design change |
| An event type between modules | `packages/core/src/events/` | `DomainEvent<'<name>', Payload>`. The folder imports no module ([events](events.md)) |
| A schema helper or a shared value list | `packages/core/src/db/` | It imports nothing from the modules ([data](data.md)) |
| An ERP adapter | `packages/erp-<system>/` | It implements `@provital/erp-port` |
| A port to an outside provider, and its adapters | The port in the module that calls it, or `packages/<name>-port/` when a unit or a package calls it. Each adapter in `packages/<name>-<provider>/` | A unit creates the adapter and passes it in. A fake for tests can stay next to the port |
| A shared package | `packages/<name>/` | `README.md` or `AGENTS.md` |
| A check or a command | `tools/<name>/` | `README.md` and a `pnpm` script |
| A CI or CD step | A workflow in `.github/workflows/` | The logic goes into a script in `scripts/ci/` or `scripts/cd/` |
| A unit or integration test | Next to the code | `<file>.test.ts`, or `<file>.int.test.ts` for PostgreSQL or the object store |
| A test builder or fixture of a module | `packages/core/src/<module>/test-support/` | Not in the module's `index.ts`; only tests import it |
| A document | Its class in the [document map](../README.md) | [Writing](writing.md) limits |
| A scratch file | `.work/` | Never committed |

`CLAUDE.md` holds only `@AGENTS.md`. Something that fits no row needs a new row first.
