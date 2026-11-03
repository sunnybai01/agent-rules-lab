# Test conventions

Source: delivery plan section 9 (Definition of done), TD-04.

- Write the test first. See it fail. Then write the code.
- Put the test next to the code: `<module>/<name>.test.ts`. vitest.
- **A test that covers an acceptance criterion starts its title with the AC ID**: `it("T3-AC-004: records the consent text version", ...)`. `pnpm trace` reports the coverage.
- Use the in-memory repositories, `InMemoryEventBus` and `fixedClock`. Use `createApp()` from `apps/worker` for a test across modules.
- Fake data only: `@example.test` addresses, invented names.
- Test the edge cases of time in the `Europe/Berlin` calendar (midnight, daylight saving time).
