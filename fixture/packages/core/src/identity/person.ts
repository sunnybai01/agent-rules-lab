import type { DomainEvent } from "../kernel";

export interface Person {
  readonly id: string;
  readonly email: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly erpCustomerNumber: string | null;
  readonly brand: string;
  readonly createdAt: string;
}

export type PersonRegistered = DomainEvent<
  "identity.person-registered",
  { personId: string; brand: string }
>;

/** Storage of the `identity` schema. Production uses Drizzle; tests use the in-memory store. */
export interface PersonRepository {
  insert(person: Person): Promise<void>;
  findById(id: string): Promise<Person | null>;
  findByEmail(email: string): Promise<Person | null>;
}

export class InMemoryPersonRepository implements PersonRepository {
  private readonly rows = new Map<string, Person>();

  async insert(person: Person): Promise<void> {
    this.rows.set(person.id, person);
  }

  async findById(id: string): Promise<Person | null> {
    return this.rows.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Person | null> {
    for (const person of this.rows.values()) {
      if (person.email === email) return person;
    }
    return null;
  }
}
