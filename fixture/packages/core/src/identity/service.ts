import { type Clock, type EventBus, newId, systemClock } from "../kernel";
import type { Person, PersonRegistered, PersonRepository } from "./person";

export interface RegisterPersonInput {
  email: string;
  givenName: string;
  familyName: string;
  brand?: string;
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("A person with this e-mail exists");
    this.name = "EmailAlreadyRegisteredError";
  }
}

export interface IdentityDeps {
  repo: PersonRepository;
  bus: EventBus;
  clock?: Clock;
}

export function createIdentity({ repo, bus, clock = systemClock }: IdentityDeps) {
  return {
    /** One person record per e-mail address (T3-D-009). */
    async registerPerson(input: RegisterPersonInput): Promise<Person> {
      const email = input.email.trim().toLowerCase();
      if (await repo.findByEmail(email)) throw new EmailAlreadyRegisteredError();
      const now = clock.now();
      const person: Person = {
        id: newId(now),
        email,
        givenName: input.givenName,
        familyName: input.familyName,
        erpCustomerNumber: null,
        brand: input.brand ?? "provital",
        createdAt: now.toISOString(),
      };
      await repo.insert(person);
      const event: PersonRegistered = {
        type: "identity.person-registered",
        id: newId(now),
        occurredAt: now.toISOString(),
        payload: { personId: person.id, brand: person.brand },
      };
      await bus.publish(event);
      return person;
    },

    async getPerson(id: string): Promise<Person | null> {
      return repo.findById(id);
    },
  };
}

export type Identity = ReturnType<typeof createIdentity>;
