export interface DomainEvent<TType extends string = string, TPayload = unknown> {
  readonly type: TType;
  readonly id: string;
  readonly occurredAt: string;
  readonly payload: TPayload;
}

export type EventHandler<E extends DomainEvent> = (event: E) => void | Promise<void>;

/**
 * The queue between modules. Production uses pg-boss through the outbox;
 * tests and the fixture use the in-memory bus.
 */
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<E extends DomainEvent>(type: E["type"], handler: EventHandler<E>): void;
}

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, EventHandler<DomainEvent>[]>();
  readonly published: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.published.push(event);
    for (const handler of this.handlers.get(event.type) ?? []) {
      await handler(event);
    }
  }

  subscribe<E extends DomainEvent>(type: E["type"], handler: EventHandler<E>): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler as EventHandler<DomainEvent>);
    this.handlers.set(type, list);
  }
}
