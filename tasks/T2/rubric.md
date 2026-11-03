# T2 rubric (0 = no, 1 = partly, 2 = yes)

- [ ] The contract is in `erp-port` (Zod), the fake implements it, `integration` exposes it, `identity` calls `integration`.
- [ ] The read records source, source version and read time (T2-D-009).
- [ ] The ERP outage behaviour is explicit and tested.
- [ ] Wiring is only in `apps/worker`.
- [ ] The module documentation is updated (where the layout has one).
