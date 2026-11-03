# Event conventions

Source: architecture.md section 4 rule 4, TD-08.

- A module reacts to another module through an event on the bus. It never calls the other module to write. This keeps modules independent and lets the reaction retry.
- **Name:** `<module>.<past-tense-kebab>`, for example `identity.person-registered`.
- **Type:** declare it in the emitting module with `DomainEvent<"<name>", Payload>` and export the type from the module `index.ts`. The payload holds IDs, not copies of personal data.
- **Publish** after the write succeeds: `await bus.publish(event)`.
- **Subscribe** in the reacting module. Put the handlers in `<module>/subscriptions.ts` and export `register<Module>Subscriptions(bus, deps)` from the module `index.ts`. The composition root (`apps/worker/src/index.ts`) calls it.
- The emitting module does not import the reacting module. `pnpm arch` fails on a cycle between modules.
- A handler is idempotent: the same event delivered twice gives the same result.
- List each event in the `AGENTS.md` of the emitting module and of each reacting module.
