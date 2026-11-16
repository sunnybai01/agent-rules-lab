# Module `kernel`

The shared base. It imports no other module.

## Owns

Money, time, IDs, the event bus, data metadata. Later: rule sets, settings, audit log, pilot switch, feature flags (architecture section 4).

## Invariants

- Money is never a float.
- A business date uses the `Europe/Berlin` calendar, including daylight saving time (Discovery #102).
