export type { Person, PersonRegistered, PersonRepository } from "./person";
export { InMemoryPersonRepository } from "./person";
export type { Identity, IdentityDeps, RegisterPersonInput } from "./service";
export { createIdentity, EmailAlreadyRegisteredError } from "./service";
