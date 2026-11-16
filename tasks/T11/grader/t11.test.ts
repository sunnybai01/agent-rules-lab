import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";

const register = (email: string) => createApp().identity.registerPerson({ email, givenName: "E", familyName: "Mail" });

describe("hard", () => {
  it("rejects unusable addresses with InvalidEmailError", async () => {
    for (const email of ["nobody", "a@b@example.test", "@example.test", "a b@example.test", "a@intranet"]) {
      await expect(register(email), email).rejects.toMatchObject({ name: "InvalidEmailError" });
    }
  });

  it("accepts usable addresses as before", async () => {
    for (const email of ["a@example.test", "first.last@mail.example.test", "  Mixed@Example.Test "]) {
      await expect(register(email), email).resolves.toMatchObject({ email: email.trim().toLowerCase() });
    }
  });
});
