# Module `identity`

## Owns

The person record with roles (T3-D-009), credentials, sessions, consents, preferences, pets, consultations. PostgreSQL schema `identity`.

## Public API (`index.ts`)

| Export | Use |
|---|---|
| `createIdentity({ repo, bus, clock })` | Builds the module service |
| `.registerPerson({ email, givenName, familyName, brand? })` | Creates a person. Publishes `identity.person-registered` |
| `.getPerson(id)` | Reads a person or `null` |
| `InMemoryPersonRepository` | Store for tests and the fixture |
| `EmailAlreadyRegisteredError` | Thrown when the e-mail exists |

## Tables (`schema.ts`)

| Table | Personal columns |
|---|---|
| `identity.person` | `email`, `given_name`, `family_name` |

## Events

| Event | Direction | Payload |
|---|---|---|
| `identity.person-registered` | Emits | `personId`, `brand` |

## Invariants

- One person record per e-mail address. The e-mail is stored in lower case (T3-AC-003).
- At most one ERP customer number per person (T3-AC-003).
- ERP master data comes through the `integration` module, never from the ERP port.

## Acceptance criteria

T3-AC-003, T3-AC-004.
