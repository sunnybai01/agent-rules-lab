import { businessDate, type Clock, type EventBus, newId, systemClock } from "../kernel";
import type { Task, TaskRepository } from "./task";

export interface CreateTaskInput {
  personId: string;
  kind: string;
  title: string;
  dueDate?: string;
}

export interface JourneyDeps {
  repo: TaskRepository;
  bus: EventBus;
  clock?: Clock;
}

export function createJourney({ repo, clock = systemClock }: JourneyDeps) {
  return {
    async createTask(input: CreateTaskInput): Promise<Task> {
      const now = clock.now();
      const task: Task = {
        id: newId(now),
        personId: input.personId,
        kind: input.kind,
        title: input.title,
        dueDate: input.dueDate ?? businessDate(now),
        createdAt: now.toISOString(),
      };
      await repo.insert(task);
      return task;
    },

    async listTasks(personId: string): Promise<Task[]> {
      return repo.listByPerson(personId);
    },
  };
}

export type Journey = ReturnType<typeof createJourney>;
