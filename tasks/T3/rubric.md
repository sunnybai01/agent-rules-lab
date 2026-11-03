# T3 rubric (0 = no, 1 = partly, 2 = yes)

- [ ] `identity` is unchanged or only exports the event type; `journey` subscribes.
- [ ] The subscription is wired in the composition root, not inside a module constructor of the other module.
- [ ] The handler is idempotent, with a test.
- [ ] The task does not copy personal data from `identity`.
- [ ] The module documentation lists the consumed event (where the layout has one).
