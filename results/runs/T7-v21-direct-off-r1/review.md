# T7 rubric (0 = no, 1 = partly, 2 = yes)

- [ ] `journey` knows nothing of `identity`: no import, no injected function, no call. The event is the only link.
- [ ] The handler lives in `identity` and is registered by the composition root, not written inline in `apps/worker`.
- [ ] The event and the reaction are listed in the module documentation (where the layout has one).
- [ ] The change has its own tests for the completion and for the reaction, with a fixed clock.
- [ ] The change is small and reads like the surrounding code.

Replace each [ ] with a score [0], [1] or [2]. Read diff.patch and the final message in result.json.

Reviewer:
Notes:
