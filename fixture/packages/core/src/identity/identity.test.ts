import { describe, expect, it } from "vitest";
import { fixedClock, InMemoryEventBus } from "../kernel";
import { createIdentity, EmailAlreadyRegisteredError, InMemoryPersonRepository } from "./index";

function setup() {
  const bus = new InMemoryEventBus();
  const identity = createIdentity({
    repo: new InMemoryPersonRepository(),
    bus,
    clock: fixedClock("2027-01-05T08:00:00Z"),
  });
  return { bus, identity };
}

describe("identity", () => {
  it("T3-AC-003: keeps one person record per e-mail address", async () => {
    const { identity } = setup();
    await identity.registerPerson({
      email: "Erika@Example.test",
      givenName: "Erika",
      familyName: "Muster",
    });
    await expect(
      identity.registerPerson({ email: "erika@example.test", givenName: "E", familyName: "M" }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });

  it("publishes identity.person-registered", async () => {
    const { bus, identity } = setup();
    const person = await identity.registerPerson({
      email: "max@example.test",
      givenName: "Max",
      familyName: "Beispiel",
    });
    expect(bus.published).toHaveLength(1);
    expect(bus.published[0]).toMatchObject({
      type: "identity.person-registered",
      payload: { personId: person.id },
    });
  });
});
