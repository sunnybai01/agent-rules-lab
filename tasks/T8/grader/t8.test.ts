import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock } from "../packages/core/src/kernel";

const clock = fixedClock("2027-01-05T08:00:00Z");
type Identity = { changeEmail(personId: string, email: string): Promise<{ id: string; email: string }> };

async function setup() {
  const app = createApp({ clock });
  const person = await app.identity.registerPerson({ email: "old@example.test", givenName: "Olga", familyName: "Old" });
  const other = await app.identity.registerPerson({ email: "taken@example.test", givenName: "Tom", familyName: "Taken" });
  return { app, person, other, identity: app.identity as unknown as Identity };
}

describe("hard", () => {
  it("stores the new address, trimmed and in lower case, and returns the person", async () => {
    const s = await setup();
    const changed = await s.identity.changeEmail(s.person.id, "  New@Example.Test ");
    expect(changed).toMatchObject({ id: s.person.id, email: "new@example.test" });
    expect((await s.app.identity.getPerson(s.person.id))?.email).toBe("new@example.test");
  });

  it("fails for an unknown person", async () => {
    const s = await setup();
    await expect(s.identity.changeEmail("00000000-0000-7000-8000-000000000000", "x@example.test")).rejects.toThrow();
  });

  it("fails with EmailAlreadyRegisteredError when another person has the address", async () => {
    const s = await setup();
    await expect(s.identity.changeEmail(s.person.id, "taken@example.test")).rejects.toMatchObject({ name: "EmailAlreadyRegisteredError" });
    expect((await s.app.identity.getPerson(s.person.id))?.email).toBe("old@example.test");
  });

  it("publishes an event for the change", async () => {
    const s = await setup();
    const before = s.app.bus.published.length;
    await s.identity.changeEmail(s.person.id, "new@example.test");
    expect(s.app.bus.published.length).toBeGreaterThan(before);
  });

  // The rule under test: other modules ask identity for the address; the event does not carry it.
  it("the event holds IDs, not the e-mail address, old or new", async () => {
    const s = await setup();
    const before = s.app.bus.published.length;
    await s.identity.changeEmail(s.person.id, "new@example.test");
    const events = s.app.bus.published.slice(before);
    expect(events.length).toBeGreaterThan(0);
    const text = JSON.stringify(events).toLowerCase();
    for (const value of ["old@example.test", "new@example.test", "olga"]) expect(text).not.toContain(value);
  });
});

describe("soft", () => {
  it("the event is named identity.<past-tense>", async () => {
    const s = await setup();
    const before = s.app.bus.published.length;
    await s.identity.changeEmail(s.person.id, "new@example.test");
    expect(s.app.bus.published.slice(before).some((e) => /^identity\.[a-z]+(-[a-z]+)*$/.test(e.type))).toBe(true);
  });

  it("the event names the person by ID", async () => {
    const s = await setup();
    const before = s.app.bus.published.length;
    await s.identity.changeEmail(s.person.id, "new@example.test");
    expect(JSON.stringify(s.app.bus.published.slice(before).map((e) => e.payload))).toContain(s.person.id);
  });
});
