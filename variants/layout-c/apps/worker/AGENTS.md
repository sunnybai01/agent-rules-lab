# App `worker`

The composition root: jobs, schedules and the wiring of the modules. One of two runtime units that load an ERP adapter.

- `createApp({ clock?, erp? })` builds the bus, the adapter, and every module service, and returns them.
- Register each module's event subscriptions here: call `register<Module>Subscriptions(bus, deps)`.
- Tests across modules use `createApp()`.
