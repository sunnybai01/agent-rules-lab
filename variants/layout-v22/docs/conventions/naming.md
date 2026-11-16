# Naming conventions

## Domain read function

The rule applies to an exported function of a module that takes the database first.

| Shape | Use it for | Example |
|---|---|---|
| `<thing>Of` | The record or the set that one key owns | `petsOf(db, personId)` |
| `<thing>At` | The same, on a date | `sponsorAt(db, advisorId, date)` |
| `list<Things>` | Records of many keys, with a filter | `listCategories(db)` |
| `is`, `has`, `can` | A yes or no | `hasConsent(db, input)` |

- Do not use the prefixes `get`, `find`, `read`, `fetch`, `load`, `lookup`, `query` or `select`.
- Do not use the suffix `For` or a bare noun such as `articleDetail`.
- Start a write with its verb: `addPet`.

## Not found

- A record or a registered key that is not there, or that the caller may not see, is `<thing>NotFound`.
- The code is `commerce.articleNotFound`. The class is `PetNotFoundError`.
- Do not use `Unknown`, `NoSuch` or `NotExists`.

## Expected refusal

- Use a module error class only for an outcome that code catches: a job, a retry or another module. An example is `CopyBatchNotFoundError`.

## Read model

- The type that a read returns ends in `View`: `MediaView`, `CartLineView`.
- Do not use `Item`, `Detail`, `Summary`, `PageData`, `Info` or `Dto`.
- `Page` is one page of a paged list, with `nextCursor`: `AuditPage`.
- `Row` is a row of a table or of an ERP copy batch. An app has no `Row` type.
- `Entry` is one line of a log or a history: `AuditEntry`.
