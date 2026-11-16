# Event conventions

Source: [architecture.md section 4](../architecture.md#4-modules), T3-D-003, ADR-0023, ADR-0024.

- A business module reacts to another business module through an event on the queue (pg-boss in PostgreSQL). It never calls the other module to write. So the reaction can retry.
- A platform module (`kernel`, `integration`) reports to a business module only through an event. A business module may call a platform command in its own transaction.
- **Name:** `<module>.<past-tense-kebab>`, for example `identity.person-registered`. The types in `packages/core/src/events` list the events.
- **Type:** declare it in `packages/core/src/events` as `DomainEvent<'<name>', Payload>`. Emitter and consumers import it from there, so an event needs no import between two modules.
- **Payload:** IDs, not personal data. Add only optional fields, or a new value of a value list that every subscriber skips when it does not know it. Any other change needs a new event name.
- **Publish:** never send an event to a queue directly.
- **Subscribe** in `<module>/subscriptions.ts`.
- A handler throws to fail.
- The outbox of `integration` is separate. It carries messages to the ERP, not events.
- `pnpm arch` fails on an import against the module order.
- A module `AGENTS.md` lists no events. The event types and `subscriptions.ts` show them.
