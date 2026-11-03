import { describe, expect, it } from "vitest";
import { createApp } from "./index";

describe("worker composition", () => {
  it("wires the modules", async () => {
    const app = createApp();
    const person = await app.identity.registerPerson({
      email: "a@example.test",
      givenName: "A",
      familyName: "B",
    });
    expect(await app.identity.getPerson(person.id)).toEqual(person);
  });
});
