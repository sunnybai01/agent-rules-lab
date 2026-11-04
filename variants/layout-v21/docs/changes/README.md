# Change records

A record of a change to the requirements: a new package version, a change that Provital asks for or approves, or a spec that contradicts the text of an ID (design story trigger 5). How a spec maps an ID onto names and fields is not a change: it goes under "Local decisions" in the spec. A record is not changed after approval. IDs are never reused: an old ID gets `supersededBy` in the register.

| Record | When |
|---|---|
| `BL-v<version>.md` | A new version of the Discovery package. Start with `pnpm ids diff <old> <new>`, then add the decision per changed ID |
| `CR-NNN-short-title.md` | One change after the baseline, at most 40 lines. Template below |

After a change record, `pnpm ids` fails on each open spec and test that cites a superseded ID. Set those specs to `Stale` and get them approved again.

## CR template

```markdown
# CR-NNN: <change>

- **Source:** <who asked, where: meeting, e-mail, Jira>
- **Date:** YYYY-MM-DD
- **Class (DR section 8):** structural change | setting | new rule-set entry | late input
- **IDs:** <old ID> → <new ID>, or new: <ID>

## Impact

The output of `pnpm ids impact <old IDs>`: specs, tests, modules, ADRs.

## Decision

What we do, who decided. A structural change goes through Provital's change control first.

## Jira

New or changed issues.
```
