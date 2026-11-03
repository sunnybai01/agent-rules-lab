export interface Task {
  readonly id: string;
  readonly personId: string;
  readonly kind: string;
  readonly title: string;
  /** Business date, YYYY-MM-DD in Europe/Berlin. */
  readonly dueDate: string;
  readonly createdAt: string;
}

export interface TaskRepository {
  insert(task: Task): Promise<void>;
  listByPerson(personId: string): Promise<Task[]>;
}

export class InMemoryTaskRepository implements TaskRepository {
  private readonly rows: Task[] = [];

  async insert(task: Task): Promise<void> {
    this.rows.push(task);
  }

  async listByPerson(personId: string): Promise<Task[]> {
    return this.rows.filter((t) => t.personId === personId);
  }
}
