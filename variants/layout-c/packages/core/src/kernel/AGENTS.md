# Module `kernel`

The shared base. It imports no other module.

## Owns

Money, time, IDs, the event bus, data metadata. Later: rule sets, settings, audit log, pilot switch, feature flags (architecture section 4).

## Public API (`index.ts`)

| Export | Use |
|---|---|
| `money(amountMinor)`, `add`, `applyRate` | Money in minor units. `applyRate` rounds half away from zero |
| `businessDate(instant)` | The `Europe/Berlin` date of an instant, `YYYY-MM-DD` |
| `Clock`, `systemClock`, `fixedClock(iso)` | Time source. Inject it; never call `new Date()` in a rule |
| `newId(now)` | UUIDv7 |
| `DomainEvent`, `EventBus`, `InMemoryEventBus` | Events between modules ([conventions](../../../../docs/conventions/events.md)) |
| `withDataMeta`, `notPersonal`, `ColumnMeta` | Data metadata for each column ([conventions](../../../../docs/conventions/data.md)) |

## Invariants

- Money is never a float.
- A business date uses the `Europe/Berlin` calendar, including daylight saving time (Discovery #102).
