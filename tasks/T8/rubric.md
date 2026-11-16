# T8 rubric (0 = no, 1 = partly, 2 = yes)

- [ ] The event carries only what another module needs to look the change up (the person ID); no address, no name.
- [ ] The event type is declared in `identity`, exported from its `index.ts` and listed in the module documentation (where the layout has one).
- [ ] The address is normalised in one place, shared with `registerPerson`, not copied.
- [ ] The change has its own tests: the change, the duplicate, the unknown person, the event.
- [ ] The change is small and reads like the surrounding code.
