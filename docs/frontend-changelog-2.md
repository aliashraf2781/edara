# Frontend Changelog (2)

Continues from `docs/frontend-changelog.md` — kept separate rather than
editing it. Same format: most recent first, each entry says what changed,
why, and whether it's breaking. Cross-references
`docs/frontend-api-guide.md` (endpoint reference) and
`docs/frontend-ui-spec.md` (screen-level guidance) where relevant — this
doc is the "what changed and when," those are the "what it looks like now."

---

## 2026-09-21 — Backend architecture pivot: shared database instead of one database per school

**Not a request/response shape change for most endpoints — but a real
architectural shift worth knowing about, since it affects what's possible
going forward (e.g. no more per-school physical database backup/restore,
no more per-school database credentials of any kind).**

**Why:** Production runs on Hostinger shared hosting. We confirmed via a
direct `SHOW GRANTS` check that the app's MySQL account has full access
to only its own single database and **no ability to `CREATE DATABASE` at
all** — not a bug, a hosting-tier limitation. The original design (every
school gets its own physical MySQL database, created automatically on
signup) cannot work on this hosting, automatically or otherwise. The
decision made: keep provisioning fully automatic, give up per-school
physical database isolation. Every school's data now lives in one shared
database, isolated by a `tenant_id` column enforced in application code
instead of by separate connections.

**What actually changes for you as a frontend consumer: nothing in the
request/response shapes you already integrated against.** Every endpoint
in `docs/frontend-api-guide.md` keeps the same URL, method, body, and
response shape. School creation is still one call
(`POST /admin/tenants`), still returns the same `{tenant, superAdmin}`
shape, still returns instantly — actually **faster** now, since there's no
database-creation step to wait on. Login is still `{email, password}`.
Staff account creation, results, imports — all unchanged from your side.

**What's different under the hood, worth knowing:**
- A school's data is no longer something that can be backed up, restored,
  or exported as one standalone database file — if a "download my
  school's data" export feature is ever built, it now means a filtered
  export of shared tables, not a database dump.
- There's no more "database credentials" concept per school at all —
  nothing to configure, migrate, or provision per school beyond the rows
  already returned by the API.
- If you were ever shown or told about `databaseName`/`databaseHost`
  fields on the `Tenant` object in earlier conversations — those are
  gone. They were already dropped from `TenantResource` in an earlier
  change; this pivot just confirms they're never coming back.

No action needed on your end unless you built something assuming a
literal separate database per school existed (e.g., a per-school
connection string, a per-school backup download link). If you did,
that assumption needs to go.
