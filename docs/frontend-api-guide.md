# Frontend API Guide

**Written for: frontend engineers integrating with this API.** This covers
every endpoint that exists today, exactly as implemented — including the
inconsistencies below, called out explicitly rather than smoothed over, so
you don't get surprised in testing. New endpoints (tenant-facing, results,
imports, reporting) will be added here as later phases build them.

Base URL: `/api/v1`. All requests/responses are JSON unless noted.

---

## 1. Response conventions

**Almost all endpoints** return this envelope:

```json
{ "success": true, "message": "Human-readable message", "data": /* mixed, or null */ }
```

Errors use the same envelope with `"success": false`:

```json
{ "success": false, "message": "What went wrong", "data": null }
```

Common status codes: `401` unauthenticated, `403` forbidden, `404` not
found, `422` validation error (see below), `429` rate limited.

**Validation errors** (`422`) put the field-level errors in `data`:

```json
{ "success": false, "message": "The given data was invalid.", "data": { "email": ["The email field is required."] } }
```

**Paginated lists** wrap the page inside `data`:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "data": [ /* items */ ],
    "meta": { "total": 42, "per_page": 15, "current_page": 1, "last_page": 3 },
    "links": { "next": "https://.../resource?page=2" }
  }
}
```

There is no `prev` link and no `from`/`to` in `meta` — only what's shown above.

**⚠️ Exception: file downloads and one internal test route** return
non-JSON or a different shape — see §4 and the note at the end of this doc.

### Filtering, sorting, search

Where supported (noted per-endpoint): `?filter[field]=value`,
`?sort=field` or `?sort=-field` (descending; comma-separate for multiple),
`?search=term`, `?per_page=20`. Only an explicit allow-list of fields works
per endpoint — arbitrary field names are silently ignored, not errors.

### Localization

Send `Accept-Language: en` or `Accept-Language: ar`, or `?lang=en`/`?lang=ar`.
Anything else falls back to the app default. (A previous bug where a full
browser-style `Accept-Language: en-US,en;q=0.5` header crashed the API with
a 500 has been fixed — but only send `en` or `ar` regardless.)

### Rate limits

Every endpoint is rate-limited by tier (requests/minute, per user if
authenticated else per IP): `public` 30, `auth` 10, `user` 120, `admin` 300,
`upload` 20, `search` 60. A `429` response includes a `Retry-After` header
(seconds).

---

## 2. Authentication

Bearer tokens (`Authorization: Bearer <token>`), issued by
`POST /api/v1/auth/login` (and a few other endpoints below). There is no
session/cookie auth for the API.

### 2.1 Register

`POST /api/v1/auth/register`

```json
{ "name": "Ahmed", "email": "ahmed@example.com", "password": "Passw0rd!", "password_confirmation": "Passw0rd!" }
```
Password must be 8+ chars with letters, mixed case, numbers, and symbols.
`roles` is optional (`roles: ["some-role"]`, must be existing role names —
in practice this is for internal/seeded use, not a public self-service
role picker).

**201** →
```json
{ "success": true, "message": "You have registered successfully.", "data": { "user": { /* User object, see §2.7 */ }, "verificationCode": 123456 } }
```
The 6-digit `verificationCode` is returned directly in the response (also
emailed) — the account is **unverified** until `POST /auth/verify` succeeds,
and **login is blocked until verified** (see 2.2).

### 2.2 Login

`POST /api/v1/auth/login`

```json
{ "email": "ahmed@example.com", "password": "Passw0rd!" }
```

**200** →
```json
{
  "success": true,
  "message": "You have logged in successfully.",
  "data": {
    "user": { /* User object */ },
    "accessToken": "1|abcdef...",
    "tokenType": "Bearer",
    "accessExpiresIn": 7200,
    "refreshToken": "9f8e...",
    "refreshExpiresIn": 2592000
  }
}
```
Note the camelCase field names (`accessToken`, not `access_token`).
`accessExpiresIn`/`refreshExpiresIn` are seconds (2 hours / 30 days).

If the account isn't email-verified yet, login is **rejected** (422,
field `email`) and a fresh verification code is sent automatically.

### 2.3 Verify email

`POST /api/v1/auth/verify`
```json
{ "email": "ahmed@example.com", "code": "123456" }
```
**200** → `data: true` (a bare boolean, not an object — unusual but exact).

`POST /api/v1/auth/resend-verification` — `{ "email": "..." }` → resends the
code, `data: { "verificationCode": 123456 }`.

### 2.4 Refresh token

`POST /api/v1/auth/refresh-token` (requires `rate_limit:user`, no bearer
token needed for this call itself)
```json
{ "refresh_token": "9f8e..." }
```
**200** → the **same shape as login** (`user`, `accessToken`, `tokenType`,
`accessExpiresIn`, `refreshToken`, `refreshExpiresIn`) — the refresh token
**rotates** on every use; the old one is invalidated, so always store the
new `refreshToken` from the response.

### 2.5 Password reset — use the code-based flow

There are two parallel forgot-password flows in the backend; **only the
code-based one is fully wired end-to-end** — the link-based one
(`forgot-password-link` / `GET reset-password/{token}`) verifies a link but
has no working "set new password" step behind it currently. Use this flow:

1. `POST /api/v1/auth/forgot-password` `{ "email": "..." }` →
   `data: { "reset_code": 123456 }` (also emailed).
2. `POST /api/v1/auth/verify-reset-code` `{ "email": "...", "code": "123456" }` →
   `data: { "token": "<60-char token>" }`.
3. `POST /api/v1/auth/reset-password` `{ "token": "<from step 2>", "password": "...", "password_confirmation": "..." }` →
   `data: null` on success.

### 2.6 Logout

`POST /api/v1/auth/logout` (auth required) — revokes **all** of the user's
tokens (not just the current one). `data: null`.

### 2.7 The `User` object

Returned wherever "user" appears in a response:

```json
{
  "id": "uuid-or-numeric-id",
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "phone": null,
  "avatar": "https://.../avatar.jpg or null",
  "status": "active",
  "emailVerified": true,
  "lastLoginAt": "2026-01-01 12:00:00",
  "locale": "en",
  "timezone": "UTC",
  "preferences": { },
  "roles": ["global-admin"],
  "createdAt": "2026-01-01 12:00:00",
  "updatedAt": "2026-01-01 12:00:00"
}
```
`status` is one of `pending`/`active`/`rejected`/`suspended`/`banned`. Any
non-active status blocks API access with a specific 403 message
(account pending/rejected/suspended/banned).

### 2.8 Profile (auth required, all under `/api/v1/auth/profile`)

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/` | — | Returns the User object |
| POST | `/` | `name?, phone?, locale? (en/ar), timezone?` | all fields optional |
| POST | `/password` | `current_password, new_password, new_password_confirmation` | same password strength rule as registration |
| POST | `/avatar` | multipart `avatar` file (jpeg/png/jpg/gif/webp, max 2MB) | replaces any existing avatar |
| DELETE | `/avatar` | — | removes the avatar |
| GET | `/preferences` | — | see default shape below |
| POST | `/preferences` | `notifications?, ui?` (see below) | **shallow merge** — sending `notifications` replaces the whole `notifications` object, it does not deep-merge individual keys |
| DELETE | `/` | `{ "password": "..." }` | deletes the account; wrong/missing password → 422 |

Default preferences shape:
```json
{ "notifications": { "email": true, "sms": false, "push": true }, "ui": { "theme": "system", "compact_mode": false } }
```
`ui.theme` accepts `light`/`dark`/`system`.

### 2.9 Social login

`POST /api/v1/auth/social/redirect` `{ "provider": "google" }` (or
`facebook`) → `data: { "redirectUrl": "https://accounts.google.com/..." }`
— send the user's browser there.

`GET /login/{provider}/callback` — **not** under `/api/v1`, this is the
OAuth callback the provider redirects back to; on success it returns the
same token shape as login. Auto-registers a new account (auto-verified) if
the email hasn't been seen before, or links to an existing account by email.

`GET /api/v1/auth/social/accounts` (auth required) → list of linked
providers: `[{ "provider": "google", "created_at": "..." }]` — note this one
is **snake_case**, not camelCase like most of this API.

`DELETE /api/v1/auth/social/{provider}/unlink` (auth required) — refuses
(422) if it's the user's only login method (no password set and no other
linked providers).

---

## 3. Administration (`/api/v1/admin/*`) — global-admin only

Every route below requires: a valid bearer token for a **global** (central
identity) account, that account must be `active` status, and the specific
permission/role noted. All are rate-limited at the `admin` tier (300/min).

| Method | Path | Body | Requires | Notes |
|---|---|---|---|---|
| GET | `/me` | — | any authenticated global identity | Returns `{ "user": {...}, "permissions": [...] }` |
| GET | `/tenants` | — | `view-tenants` | Filter: `status`, `provisioning_status`, `governorate`. Sort: `code`, `name`, `created_at`. Search: `name`, `name_ar`, `code`. Paginated. |
| POST | `/tenants` | `{ "name", "code", "name_ar"?, "contact_email"?, "contact_phone"?, "governorate"?, "address"?, "database_host"?, "database_port"? }` | `create-tenant` | **Never** send `database_name` — it's server-computed from `code` and rejected (422) if present. Creates the registry record only; no database is provisioned yet. |
| GET | `/tenants/{code}` | — | `view-tenant` | `{code}` is the school's human code, e.g. `CAI-0001` |
| POST | `/tenants/{code}` | `{ "name"?, "name_ar"?, "contact_email"?, "contact_phone"?, "governorate"?, "address"?, "settings"? }` | `update-tenant` | `code` and every `database_*` field are rejected (422) on this endpoint |
| DELETE | `/tenants/{code}` | — | `global-admin` role | Soft-deletes the registry record only — never touches a real database |
| POST | `/tenants/{code}/provision` | — | `provision-tenant` | Creates the school's real database, migrates it, and creates its Super Admin. See §3.1 below — **read this before calling it, the password is one-time-only.** |
| POST | `/tenants/{code}/activate` | `{ "reason"? }` | `change-tenant-status` | |
| POST | `/tenants/{code}/deactivate` | `{ "reason"? }` | `change-tenant-status` | `reason` is currently accepted but not yet persisted anywhere (audit logging for this is a known gap — see docs/09-security.md) |
| POST | `/tenants/{code}/admins` | `{ "user_id", "relationship": "owner"\|"officer"\|"reviewer", "is_primary"? }` | `assign-tenant-admin` | Attaches a global user as a school's responsible contact |
| DELETE | `/tenants/{code}/admins/{userId}` | — | `assign-tenant-admin` | |
| GET | `/audit-logs` | — | `view-audit-log` | Filter: `log_name`, `subject_type`, `causer_id`. Paginated. |

### The `Tenant` object (`TenantResource`)

```json
{
  "id": "6e22036f-...",
  "code": "CAI-0001",
  "name": "Al-Nasr School",
  "nameAr": null,
  "status": "pending",
  "provisioningStatus": "pending",
  "databaseName": "school_cai_0001",
  "databaseHost": null,
  "databasePort": null,
  "contactEmail": null,
  "contactPhone": null,
  "governorate": null,
  "address": null,
  "settings": null,
  "admins": [ { "id": "...", "name": "...", "email": "...", "relationship": "officer", "isPrimary": false } ],
  "createdAt": "2026-01-01 12:00:00",
  "updatedAt": "2026-01-01 12:00:00"
}
```
`status` is one of `pending`/`active`/`disabled`/`archived`.
`provisioningStatus` is one of `pending`/`provisioning`/`provisioned`/`failed`.
A newly-created tenant starts `pending`; call `POST /tenants/{code}/provision`
(§3.1) to actually create its database. There is no `databasePassword`
field, ever, under any name, in any response — this is guaranteed and
regression-tested server-side.

The list endpoint (`GET /tenants`) returns a lighter `TenantSummaryResource`
per item: `id`, `code`, `name`, `nameAr`, `status`, `provisioningStatus`,
`governorate`, `createdAt` (no admins, no database fields).

### 3.1 Provisioning a school — `POST /tenants/{code}/provision`

Call this once, after creating the tenant record, to actually create its
database. Requires `tenants.contact_email` to already be set (422 if
missing — that email becomes the Super Admin's login).

```json
{
  "success": true,
  "message": "School provisioned successfully",
  "data": {
    "tenant": { /* Tenant object, provisioningStatus now "provisioned" */ },
    "superAdmin": { "email": "admin@school.example", "temporaryPassword": "aZ3!kP9qLm2Xr7Tw" }
  }
}
```

**`temporaryPassword` is shown exactly once, in this response, and nowhere
else, ever again** — it's stored hashed server-side. Show it to the admin
operator immediately (e.g. a copy-to-clipboard modal) and tell them to hand
it to the school and have them change it on first login. There is currently
no "resend credentials" endpoint — if it's lost, that specific account's
password can only be reset through a future tenant-side password-reset flow
(not built yet), not re-fetched here.

Calling this again on an already-provisioned tenant is safe (idempotent) —
it won't recreate the database or duplicate the Super Admin, and
`temporaryPassword` comes back `null` in that case since no new password was
generated. Don't treat a `null` password as an error; check
`tenant.provisioningStatus` instead.

### Global user & role management — a different path on purpose

Managing global admin users and roles is **not** under `/admin` — it's at
the pre-existing `/api/v1/users` and `/api/v1/roles` endpoints, now properly
authenticated (previously these had no auth check at all — fixed).

| Method | Path | Requires |
|---|---|---|
| GET | `/api/v1/roles` | `view-global-users` |
| POST | `/api/v1/roles` | `global-admin` role |
| POST | `/api/v1/roles/{role}` | `global-admin` role |
| DELETE | `/api/v1/roles/{role}` | `global-admin` role |
| GET | `/api/v1/users` | `view-global-users` |
| POST | `/api/v1/users` | `create-global-user` |
| POST | `/api/v1/users/{user}` | `update-global-user` |
| DELETE | `/api/v1/users/{user}` | `delete-global-user` |
| POST | `/api/v1/users/{user}/status` | `update-global-user` |

`POST /api/v1/users` body: `{ "name", "email", "password", "password_confirmation", "roles"? }`.
Valid global roles today: `global-admin`, `admin-officer`, `reviewer` (also
the legacy `super-admin`, which is effectively a platform-owner superset).
`RoleResource`:
```json
{ "id": 1, "name": "global-admin", "permissions": ["view-tenants", "..."], "createdAt": "...", "updatedAt": "..." }
```

---

## 4. Media (`/api/v1/media/*`) — ⚠️ currently unauthenticated

No bearer-token requirement today. Handle with the same caution called out below.

`POST /` multipart: `{ "file" (required), "model_type" (fully-qualified
model class name, e.g. "Modules\\Blog\\app\\Models\\Blog"), "model_id",
"collection"? }` → attaches the file to that model's media collection.

`GET /{id}` → media object. `DELETE /{id}` → removes it.
`GET /{id}/download` → **binary file response**, not JSON.

Media object:
```json
{
  "id": 1, "fileName": "photo.jpg", "mimeType": "image/jpeg", "size": "1.2 MB",
  "urls": { "original": "...", "thumb": "...", "medium": "...", "large": "...", "webp": "..." },
  "createdAt": "2026-01-01T12:00:00.000000Z"
}
```
`thumb`/`medium`/`large`/`webp` are only present for images; non-image
files only have `urls.original`. Note `createdAt` here is a raw ISO 8601
timestamp (different format from every camelCase `createdAt` elsewhere,
which use `YYYY-MM-DD HH:MM:SS`).

---

## 5. School (tenant) API — `/api/v1/school/*`

This is the school-side app, separate from everything above. Response
envelope, pagination, and error format are the same `{success,message,data}`
shape as the rest of the API unless noted.

### 5.1 Roles

Every school user has exactly one of four roles (`user.roles` from login/
`me`), and every endpoint below is gated by role — calling one you don't
have returns **403**:

| Role | Can do |
|---|---|
| `school-super-admin` | Everything |
| `school-admin` | Everything except whatever the school's Super Admin reserves for themselves in a later phase (today: same as Super Admin) |
| `school-teacher` | Create/view students, enroll students, enter/view results, run imports, view reports — **cannot** edit academic structure (years/stages/grades/classrooms/subjects), **cannot** delete a student, **cannot** approve/reject/publish a result (can only get it to `submitted`) |
| `school-data-entry` | Same as `school-teacher` |

Concretely: `POST/PUT/DELETE` on academic-years/educational-stages/grades/
classrooms/subjects and `DELETE /students/{id}` need `school-super-admin`
or `school-admin`. `POST /results/{id}/transition` needs the same two —
a teacher can create a `draft` result but an admin has to move it through
review. Everything else under `/school/*` just needs to be logged in as
any of the four roles.

### 5.2 Login

`POST /api/v1/school/auth/login`
```json
{ "code": "CAI-0001", "email": "admin@school.example", "password": "..." }
```
`code` is the school's code — the **only** place you ever send it. Every
other school-side request identifies the school purely from the bearer
token you get back here; there's no `tenant_id`/`school_id` field on any
other request.

**200** →
```json
{ "success": true, "message": "Logged in successfully", "data": { "user": {...}, "accessToken": "1|abc...", "tokenType": "Bearer" } }
```
`user` object: `{ id, name, email, phone, status, roles: [...], createdAt }`.

**401** on wrong credentials, unknown `code`, or an inactive school.
**403** if the account itself isn't `active`.

`GET /api/v1/school/me` (auth required) → `{ user, school: {code, name}, permissions: [...] }`.

`POST /api/v1/school/auth/logout` (auth required) → revokes the current token only.

### 5.3 Academics reference data

All under `/api/v1/school/*`, auth required, standard REST resource routes
(`GET` list, `POST` create, `GET /{id}` show, `PUT/PATCH /{id}` update,
`DELETE /{id}` destroy):

| Resource | Path | Key fields |
|---|---|---|
| Academic years | `/academic-years` | `code, name, name_ar?, starts_on, ends_on, is_current?` |
| Educational stages | `/educational-stages` | `code, name, name_ar?, sort_order?` |
| Grades | `/grades` | `educational_stage_id, code, name, level?` — filter list with `?educational_stage_id=` |
| Classrooms | `/classrooms` | `grade_id, academic_year_id, code, name, capacity?` — filter with `?grade_id=`/`?academic_year_id=` |
| Subjects | `/subjects` | `grade_id?, educational_stage_id?, code, name, max_score, pass_score` — filter with `?grade_id=` |

There's no `exam-periods` endpoint yet — that reference table exists but
isn't exposed via API in this pass; results/imports below still need an
`exam_period_id`, which for now must be created directly by whoever seeds
the school's data.

### 5.4 Students

`GET /students?search=term&per_page=20` — searches student code, national
ID, first/family name. Paginated (standard envelope, see §1).

`POST /students` — `{ student_code, national_id?, first_name, father_name?, family_name?, gender: "male"|"female", birth_date?, guardian_name?, guardian_phone?, status? }`.

`GET /students/{id}` → includes `enrollments` (with classroom + academic year).

`PUT /students/{id}`, `DELETE /students/{id}` (soft delete).

**Enrollment** (a student's grade/classroom is history, not a fixed field):

`POST /students/{id}/enrollments` — `{ academic_year_id, grade_id, classroom_id, enrolled_on? }`
`GET /students/{id}/enrollments` — list of this student's enrollments across years.

### 5.5 Results workflow

`POST /results` — `{ student_enrollment_id, subject_id, exam_period_id, score?, max_score, is_absent? }`.
Upserts (same enrollment+subject+exam_period → updates the existing draft
rather than duplicating). Always created in `draft` status.

`GET /results?exam_period_id=&classroom_id=&subject_id=&status=` — paginated, filterable.

`GET /results/{id}` → includes `transitions` (full audit history).

**Status transitions** — `POST /results/{id}/transition` `{ status, reason? }`.
**Requires `school-super-admin` or `school-admin`** (see §5.1) — a teacher
can enter and submit a result but not approve/reject/publish it themselves.
Allowed status values and the only legal transitions between them:

```
draft → submitted → under_review → approved → published
                            ↳ rejected → draft
```

Any other transition (e.g. `draft` → `published` directly, or `published` →
anything) returns **422** with a message explaining what's not allowed —
the backend enforces this, sending an arbitrary status is never possible.
`reason` is required in practice for `rejected` (stored and returned on the
result).

### 5.6 Excel import (two-step preview → confirm)

The fixed-template `POST /result-imports` is **gone** (404). Real school
sheets vary in layout — even between uploads from the same school — so
every upload is previewed and its column→subject mapping is confirmed by
a human before anything is written. Full rationale, grading-type detection,
absence markers, and qualitative rating text → enum mapping:
`docs/frontend-grading-import.md`.

**Step 1** — `POST /result-imports/preview` — multipart: `file`
(`.xlsx`/`.xls`/`.csv`, max 10MB), `academic_year_id`, `exam_period_id`.
Nothing is written. Returns `resultImportId`, detected subject blocks with
`suggestedSubjectId` (nullable), and `previewRows`.

**Step 2 (client only)** — show the mapping UI always, even when every
suggestion looks correct. Filter pickers by `gradingType`. Unmapped
subjects are skipped.

**Step 3** — `POST /result-imports/{resultImportId}/confirm` with
`{ "mapping": [ { "sheet_index": 0, "subject_id": 1 } ] }` — integers
only; never column letters or Arabic subject/component labels.

**200** →
```json
{
  "success": true, "message": "Import completed",
  "data": {
    "id": 1, "status": "completed",
    "total_rows": 207, "valid_rows": 205, "invalid_rows": 2, "imported_rows": 1640,
    "errors": [
      { "row_number": 8, "error_code": "unknown_student", "error_message": "Student code not found", "row_payload": {...} }
    ]
  }
}
```
`imported_rows` counts **individual subject results**, not students.
`valid_rows`/`invalid_rows` count students. Per-cell, not all-or-nothing —
word summaries accordingly. Confirming twice on the same id returns 422.

Error codes: `duplicate_row`, `unknown_student`, `not_enrolled`,
`invalid_score`, `invalid_rating`.
`GET /result-imports/{id}` re-fetches the same report later (no list-all).

### 5.7 Reporting

`GET /reports/summary?exam_period_id=` →
```json
{ "data": { "overall": { "total": 30, "passed": 22, "average": 68.4 }, "byGrade": [ { "grade_id": 1, "total": 15, "passed": 12, "average": 71.2 } ] } }
```
Only counts **published** results — a result sitting in `draft`/`submitted`/
`under_review` doesn't affect these numbers yet. This is computed live from
this school's own data on every call (not cached) — fine for one school's
dataset size, but don't expect a cross-school comparison here; that's an
administration-side concern not built yet.

### 5.8 Staff accounts (`/users`)

**Requires `school-super-admin`.** This is what makes a school self-service
for its own staff instead of depending on the global Administration team —
a school's Super Admin (created once, at provisioning time) can create,
update, and role-assign its own admin/teacher/data-entry accounts without
any global-admin involvement. `school-admin`/`school-teacher`/
`school-data-entry` accounts cannot access any of these endpoints (403).

`GET /users?search=term&per_page=20` — searches name, email, employee code.
Paginated (standard envelope, see §1).

`POST /users` — `{ name, email, password, phone?, employee_code?, national_id?, roles: ["school-admin"] }`.
`roles` is required, non-empty, and validated against the four tenant role
names only (`school-super-admin`, `school-admin`, `school-teacher`,
`school-data-entry`) — anything else is a 422. Created active immediately,
no email verification step (unlike the global `/auth/register` flow).

**201** →
```json
{
  "success": true, "message": "Created",
  "data": { "id": 4, "name": "Nour", "email": "nour@school.example", "phone": null, "status": "active", "roles": ["school-admin"], "createdAt": "2026-09-21 10:00:00" }
}
```

**422** on validation failure — standard envelope from §1, field-level errors
in `data`:
```json
{ "success": false, "message": "The given data was invalid.", "data": { "email": ["The email has already been taken."] } }
```
Same shape for an unknown role name, e.g. `{ "roles.0": ["The selected roles.0 is invalid."] }`
if you send something outside the four tenant role names, or
`{ "roles": ["The roles field is required."] }` if you omit it entirely.

**403** — any caller without `school-super-admin` gets the standard
`{ "success": false, "message": "This action is unauthorized.", "data": null }`
regardless of how they authenticated (a valid teacher/data-entry token still
gets blocked here).

`GET /users/{id}` → same shape as above (`{ id, name, email, phone, status, roles: [...], createdAt }`).
**404** (`{ "success": false, "message": "...", "data": null }`) if `{id}`
doesn't belong to this school's own `users` table — tenant isolation means
you can never even discover another school's user ids this way.

`PUT /users/{id}` — `{ name?, phone?, employee_code?, national_id?, password?, status?: "active"|"suspended" }`
→ same shape, `message: "Updated"`.

`POST /users/{id}/roles` — `{ roles: [...] }` — replaces (not merges) the
user's role set → same shape, `message: "Roles updated"`.

`DELETE /users/{id}` (soft delete) → `{ "success": true, "message": "Deleted", "data": null }`.
**422** (`{ "success": false, "message": "You cannot delete your own account.", "data": null }`)
if you try to delete your own account.

---

## 6. Known inconsistencies to design around

- **Casing isn't uniform.** Most of the API is camelCase in response
  bodies, but social linked-accounts (`created_at`) are snake_case/raw.
  Don't assume a global convention — check the shape shown for each
  endpoint above.
- **Media has no authentication** (§4) as of this writing — don't expose
  UI built on it to untrusted users without confirming that's been fixed.
- **`/api/v1/test-send/{userId}`** exists in the backend (sends a real push
  notification with hardcoded Arabic text to any user id, no auth) — this
  is an internal test route, not a supported endpoint. Do not call it from
  a real client.
- **A school's staff accounts don't self-verify.** Unlike the global
  `/auth/register` flow, accounts created via §5.8 are active immediately
  with no email verification step.
