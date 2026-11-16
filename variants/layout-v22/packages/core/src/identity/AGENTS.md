# Module `identity`

## Owns

The person record with roles (T3-D-009), credentials, sessions, consents, preferences, pets, consultations. PostgreSQL schema `identity`.

## Invariants

- One person record per e-mail address. The e-mail is stored in lower case (T3-AC-003).
- At most one ERP customer number per person (T3-AC-003).
- ERP master data comes through the `integration` module, never from the ERP port.
