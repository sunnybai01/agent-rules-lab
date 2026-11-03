# T5 rubric (0 = no, 1 = partly, 2 = yes)

- [ ] The fix is in `kernel.businessDate`, not a patch in `journey`.
- [ ] It uses the IANA zone `Europe/Berlin` (Intl), not a fixed +1/+2 offset.
- [ ] Regression tests cover winter, summer and the daylight saving change.
- [ ] The explanation of the cause is correct.
