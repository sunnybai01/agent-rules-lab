import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createApp } from "../apps/worker/src/index";
import { fixedClock } from "../packages/core/src/kernel";

const clock = fixedClock("2027-01-05T08:00:00Z");

function sources(module: string): string {
  const dir = join(import.meta.dirname, "../packages/core/src", module);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");
}

describe("hard", () => {
  it("creates one welcome task for a new person", async () => {
    const app = createApp({ clock });
    const p = await app.identity.registerPerson({ email: "w@example.test", givenName: "W", familyName: "T" });
    const tasks = await app.journey.listTasks(p.id);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ kind: "welcome-call", title: "Welcome call", dueDate: "2027-01-05" });
  });

  it("identity does not import journey", () => {
    expect(sources("identity")).not.toMatch(/from\s+["'][^"']*journey/);
  });

  it("the reaction runs through the bus", async () => {
    const app = createApp({ clock });
    await app.bus.publish({
      type: "identity.person-registered",
      id: "e1",
      occurredAt: "2027-01-05T08:00:00.000Z",
      payload: { personId: "p-from-event", brand: "provital" },
    });
    expect(await app.journey.listTasks("p-from-event")).toHaveLength(1);
  });
});

describe("soft", () => {
  it("the handler is idempotent: the same event twice gives one task", async () => {
    const app = createApp({ clock });
    const event = {
      type: "identity.person-registered",
      id: "e-dup",
      occurredAt: "2027-01-05T08:00:00.000Z",
      payload: { personId: "p-dup", brand: "provital" },
    };
    await app.bus.publish(event);
    await app.bus.publish(event);
    expect(await app.journey.listTasks("p-dup")).toHaveLength(1);
  });

  it("journey registers its handlers in subscriptions.ts", () => {
    expect(readdirSync(join(import.meta.dirname, "../packages/core/src/journey"))).toContain("subscriptions.ts");
  });
});
