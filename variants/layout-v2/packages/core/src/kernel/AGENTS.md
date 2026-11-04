# Module `kernel`

The shared base. It imports no other module.

## Owns

Money, time, IDs, the event bus, data metadata. Later: rule sets, settings, audit log, pilot switch, feature flags (architecture section 4).

## Public API (`index.ts`) <!-- verified: exports -->

| Export | Use |
|---|---|
| `money(amountMinor)`, `add`, `applyRate`, `Money`, `Currency` | Money in minor units. `applyRate` rounds half away from zero |
| `businessDate(instant)`, `BUSINESS_TIME_ZONE` | The `Europe/Berlin` date of an instant, `YYYY-MM-DD` |
| `Clock`, `systemClock`, `fixedClock(iso)` | Time source. Inject it; never call `new Date()` in a rule |
| `newId(now)` | UUIDv7 |
| `DomainEvent`, `EventHandler`, `EventBus`, `InMemoryEventBus` | Events between modules ([conventions](../../../../docs/conventions/events.md)) |
| `withDataMeta`, `notPersonal`, `dataMetaOf`, `ColumnMeta`, `PersonalDataCategory` | Data metadata for each column ([conventions](../../../../docs/conventions/data.md)) |

## Events <!-- verified: events -->

None. The kernel defines the bus; it publishes no event.

## Invariants

- Money is never a float.
- A business date uses the `Europe/Berlin` calendar, including daylight saving time (Discovery #102).

## Acceptance criteria

None.
