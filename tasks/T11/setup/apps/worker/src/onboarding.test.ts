import { describe, expect, it } from "vitest";
import { createApp } from "./index";

describe("onboarding of an internal contact", () => {
  it("registers the service desk contact and plans its first task", async () => {
    const app = createApp();
    const contact = await app.identity.registerPerson({
      email: "servicedesk@intranet",
      givenName: "Service",
      familyName: "Desk",
    });
    const task = await app.journey.createTask({
      personId: contact.id,
      kind: "onboarding",
      title: "Set up the service desk contact",
    });
    expect(await app.journey.listTasks(contact.id)).toEqual([task]);
  });
});
