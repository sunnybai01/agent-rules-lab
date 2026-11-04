# App `worker`

The composition root: jobs, schedules and the wiring of the modules. One of two runtime units that load an ERP adapter.

## Public API (`src/index.ts`) <!-- verified: exports -->

| Export | Use |
|---|---|
| `createApp({ clock?, erp? })` | Builds the bus, the adapter and every module service, and returns them |
| `App`, `AppOptions` | Types of the app and its options |

## Rules

- Register each module's event subscriptions here: call `register<Module>Subscriptions(bus, deps)`.
- Tests across modules use `createApp()`.
