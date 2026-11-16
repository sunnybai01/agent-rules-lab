# Module `journey`

## Owns

Events, journeys, tasks, leads, messages, advisor e-mails. PostgreSQL schema `journey`.

## Invariants

- A task never copies personal data from `identity`. It stores the `personId`.
