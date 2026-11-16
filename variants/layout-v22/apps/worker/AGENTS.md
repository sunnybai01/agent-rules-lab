# App `worker`

The composition root: jobs, schedules and the wiring of the modules. One of two runtime units that load an ERP adapter.

## Rules

- Register each module's event subscriptions here: call `register<Module>Subscriptions(bus, deps)`.
- Tests across modules use `createApp()`.
