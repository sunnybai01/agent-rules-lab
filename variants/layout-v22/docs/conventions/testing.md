# Test conventions

Source: delivery plan section 9 (definition of done), rulebook v3 ([ai-development.md](../engineering/ai-development.md)).

## Test layers

| Layer | Where | Command | When it runs |
|---|---|---|---|
| Unit | `*.test.ts` next to the code | `pnpm test`, part of `pnpm check` | Every push of a pull request |

- Write the test first. See it fail. Then write the code.
- **Unit tests** need no database.
- **Unit and integration tests carry no Discovery IDs in their names.** The cases of an Ending decide whether an ID is complete.
- A pass on the fake ERP is never a pass on NAV.
- Fake data only: `@example.test` addresses, invented names. No real customer or advisor data, also not from the NAV test environment.
- Test the edge cases of time in the `Europe/Berlin` calendar (midnight, daylight saving time).
