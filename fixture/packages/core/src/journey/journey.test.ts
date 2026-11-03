import { describe, expect, it } from "vitest";
import { fixedClock, InMemoryEventBus } from "../kernel";
import { createJourney, InMemoryTaskRepository } from "./index";

describe("journey", () => {
  it("creates a task due today by default", async () => {
    const journey = createJourney({
      repo: new InMemoryTaskRepository(),
      bus: new InMemoryEventBus(),
      clock: fixedClock("2027-01-05T08:00:00Z"),
    });
    const task = await journey.createTask({ personId: "p1", kind: "call", title: "Call" });
    expect(task.dueDate).toBe("2027-01-05");
    expect(await journey.listTasks("p1")).toEqual([task]);
  });
});
