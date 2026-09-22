# Frontend Changelog

Chronological record of backend changes that affect frontend integration,
most recent first. Each entry says what changed, why, and whether it's
breaking. Cross-references `docs/frontend-api-guide.md` (endpoint
reference) and `docs/frontend-ui-spec.md` (screen-level guidance) where
relevant — this doc is the "what changed and when," those are the "what
it looks like now."

---

## 2026-09-21 — School login is now just `{ email, password }` — no `code` field

**Breaking.**

`POST /api/v1/school/auth/login` no longer accepts or requires a `code`
field. The tenant code is now embedded directly into every `TenantUser`'s
stored email at creation time (both the Super Admin created by
`POST /admin/tenants` and any staff account created via
`POST /school/users`), and parsed back out of the submitted email at login
to figure out which school's database to check credentials against.

- `admin_email: "admin@pp.com"` + generated code `SCH-KJFZBV` → the actual
  stored/login email becomes **`admin_SCH-KJFZBV@pp.com`** — a different
  string than what was typed into the creation form. Same transformation
  happens for every staff account created afterward via
  `POST /school/users`.
- **This actual login email is only ever surfaced in the response of the
  call that created the account** — you must read it from there and
  display/hand it over, never assume it equals whatever raw email was
  submitted.
  - `POST /admin/tenants` response shape changed to carry it:
    `data` is now `{ tenant: {...}, superAdmin: { email: "admin_SCH-KJFZBV@pp.com" } }`
    (previously just the tenant object directly — update any code reading
    `data.id`/`data.code`/etc. to read `data.tenant.id` etc. instead).
  - `POST /school/users` response's `email` field **is** the actual login
    email (unchanged shape, just note the value differs from what you
    submitted) — this is what you show the newly created staff member.
- `POST /api/v1/school/auth/login` body is now just `{ "email", "password" }`.
- This also means: **don't try to search/filter staff accounts by the
  original plain email** the operator typed — only the composite (code
  embedded) email is stored, so `?search=admin@pp.com` on
  `GET /school/users` won't match `admin_SCH-KJFZBV@pp.com`. Searching by
  name or a partial fragment still works fine.
- The school's `code` itself still exists and still shows up in the
  `Tenant` object (`GET /admin/tenants/{code}` etc.) — it's just no
  longer something a human ever types at login.

---

## 2026-09-21 — Removed the account-status access gate (`CheckStatus`)

**Behavior change, not an endpoint shape change.**

The `CheckStatus` middleware — which blocked API access for any global
user account not in `active` status (`pending`/`rejected`/`suspended`/
`banned`) — has been removed from every route it was on (Administration
and Authorization admin routes; it was never applied to general `/auth/*`
routes). This was the root cause of a real incident: a `super-admin`
account got permanently locked out by simply carrying the database's
default `status` value, with no way to self-recover since there's no one
above a super-admin to "approve" it.

Registration already creates accounts as `active` immediately (this
didn't change), so this mostly affects the admin moderation endpoint,
`POST /users/{user}/status` — it still lets an admin set a user's status,
but **that value currently has no enforcement effect**. If you have UI
copy implying "suspending a user blocks their access," that's not
currently true; treat the status field as informational until a
replacement moderation mechanism is documented here. See guide §2.7.

---

## 2026-09-21 — Simplify school & staff account creation, drop bilingual name fields

**Breaking.**

- **School creation is now one call, not two.** `POST /api/v1/admin/tenants`
  now creates the school record, provisions its real database, and
  activates it — all in one request. The separate "create record, then
  call `/provision` separately" flow is gone from the normal path (that
  endpoint still exists, but only as a retry path if the automatic
  provisioning step fails).
  - Request body is now just `{ "name", "admin_email", "admin_password" }`.
  - `code` is **auto-generated** server-side (e.g. `SCH-IR4QGT`) — stop
    sending it, stop asking the operator to type one.
  - `contact_phone`, `governorate`, `address`, `database_host`,
    `database_port` are no longer accepted at creation — they can still be
    set later via `POST /tenants/{code}`.
  - The response is no longer a "pending, go provision it" tenant — it
    comes back already `status: "active"` and
    `provisioningStatus: "provisioned"`, ready to use immediately.
  - There is **no more one-time-password reveal screen** for the normal
    flow — the operator sets the Super Admin's password themselves in the
    same form. (A one-time-password reveal is still needed for the rare
    manual-retry path — see guide §3.1.)
  - See guide §3.1 and ui-spec §1.5 (fully rewritten).

- **Staff account creation (`POST /api/v1/school/users`) is now just
  `{ name, email, password }`.** `phone`, `employee_code`, `national_id`,
  and — importantly — **`roles` are no longer accepted or required at
  creation.** A new account starts with an empty `roles: []`. Assign a
  role afterward via the existing `POST /users/{id}/roles` (unchanged
  otherwise — still replaces, not merges). Remove any role-picker from
  your "create staff" form; it belongs on a separate "assign roles"
  screen now. See guide §5.8 and ui-spec §2.8.

- **Every bilingual `name`/`name_ar` field is gone — just `name` now.**
  Affected everywhere: Tenant (school), AcademicYear, EducationalStage,
  Grade, Classroom, Subject, ExamPeriod. Also removed `full_name_ar` /
  `full_name_en` from Student (the structured `first_name`/`father_name`/
  `family_name` fields are the only source of truth there, unaffected).
  Stop sending `name_ar`/`nameAr` anywhere — the API rejects/ignores it
  now, and no response includes it. Update any form, table column, or
  TypeScript type that referenced `nameAr`/`name_ar`.

- **`role:global-admin`-only routes now also accept `super-admin`.**
  `DELETE /admin/tenants/{tenant}`, `POST/PUT/DELETE /roles*` previously
  403'd for the platform-owner `super-admin` role even though it has every
  permission — this was a backend bug (spatie's `role:`/`permission:`
  route middleware doesn't consult the Gate bypass `super-admin` normally
  relies on). No frontend change needed; these routes just work now for
  that role where they didn't before.

---

## 2026-09-21 — Grading model: numeric vs. qualitative subjects

**Additive**, but changes how you must render Subjects and Results.

Real Egyptian school result sheets showed that not every subject is
graded with a number — "skill" subjects (Tokatsu, multidisciplinary,
advanced level, PE, art, music) and *every* subject in 1st/2nd primary use
a four-band descriptive scale instead. See
`docs/frontend-grading-import.md` for the full explanation, the color/label
table, and UI implications for the Results and Academic Structure screens.
Short version:

- `Subject` now has `grading_type`: `"numeric"` or `"qualitative"`.
  `max_score`/`pass_score` are `null` for qualitative subjects.
- `Result` now has `qualitative_rating` (one of `exceeds_expectations` /
  `meets_expectations` / `sometimes_meets_expectations` /
  `below_expectations`), populated **instead of** `score`/`max_score` when
  the subject is qualitative.
- A backend-operated CLI tool (`school:seed-academics`) can now seed a
  school's subject list directly from one of its own real result sheets,
  detecting grading type automatically — not a frontend-facing endpoint
  yet, but it means a newly provisioned school's Academic Structure screen
  may already have subjects populated; don't assume it always starts empty.

---

## 2026-09-21 — Error response envelope now actually matches the docs

**Bug fix — was silently broken before, now fixed to match what the guide
always claimed.**

Framework-level errors (**422** validation, **401** unauthenticated,
**403** forbidden, **404** not found, **429** rate limited, **500**
server errors) previously bypassed the app's custom error formatting
entirely and returned Laravel's raw default shape instead — e.g. a 422
came back as `{"message": "...", "errors": {...}}` with no `success`/`data`
keys, and a 404 in debug mode could leak a full stack trace. **This is now
fixed**: every error response actually returns
`{ "success": false, "message": "...", "data": ... }` as documented in
guide §1. If your error-handling code had a workaround for the old
mismatched shape, it can be removed now — but verify against a real
request rather than assuming, since this was inconsistent before.

---

## 2026-09-21 — Staff account management added (then simplified above)

`POST/GET/PUT/DELETE /api/v1/school/users` and
`POST /api/v1/school/users/{id}/roles` were added this session, letting a
school's own `school-super-admin` create and manage its staff accounts
without global-admin involvement. See the entry above for the simplified
final shape of `POST /users` — the roles-required version briefly existed
mid-session but was replaced before this reached you.

---

## 2026-09-21 — Result import is now two-step (preview → confirm)

**Breaking.**

`POST /result-imports` (fixed `student_code`/`subject_code`/`score`
template) is gone — 404. The only path is:

1. `POST /result-imports/preview` → suggested column→subject mapping
2. Operator reviews mapping (always — never auto-skip)
3. `POST /result-imports/{id}/confirm` with `{ sheet_index, subject_id }`
   integers only

See `docs/frontend-grading-import.md` for the full contract, error codes
(`invalid_rating` replaces `unknown_subject`), and student-vs-subject-result
count semantics. Frontend `/school/imports` implements this wizard.

---

## Known gaps not yet addressed (tracked here so nothing is assumed silently)

- No dedicated printable-certificate endpoints yet (بيان قيد / official
  result transcript) — assemble client-side from existing student/result
  endpoints for now. See `docs/frontend-grading-import.md` §8.
- No saved import mappings / import history list / inline subject creation
  from an unmatched sheet column / frontend trigger for
  `school:seed-academics` — see `docs/frontend-grading-import.md` §7.
- 1st/2nd primary's descriptive-only grading is representable in the data
  model (`grading_type: "qualitative"`) but no UI guidance beyond the
  Results screen notes in `docs/frontend-ui-spec.md` §2.5 has been written
  for it specifically.
