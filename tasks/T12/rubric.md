# T12 rubric (0 = no, 1 = partly, 2 = yes)

- [ ] The working-day arithmetic is one pure function on a business date, in `kernel`, with no clock inside.
- [ ] `createFollowUp` reads the time once, from the injected clock.
- [ ] The tests use a fixed clock and cover a weekend and midnight in the Europe/Berlin calendar.
- [ ] The limits of `workingDays` fail with a named error, tested.
- [ ] The change is small and reads like the surrounding code.
