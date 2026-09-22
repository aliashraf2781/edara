# Frontend UI Specification

This describes the screens, flows, and states needed to build a frontend
against the API documented in `docs/frontend-api-guide.md`. It covers two
separate applications sharing no UI code and no session state:

1. **Global Admin Portal** — used by the platform's own staff (`/api/v1/admin/*`).
2. **School Portal** — used by each school's own staff (`/api/v1/school/*`).

A user of one is never a user of the other — different login screens,
different tokens, different backend databases entirely. Do not build a
single "switch context" UI; these are two products.

---

## 1. Global Admin Portal

### 1.1 Login

Single screen: email + password → `POST /auth/login`. On success store
`accessToken`/`refreshToken`, redirect to Schools list. On 422
(unverified email) show the verification screen instead (rare for
internal staff accounts, but the API allows it — see guide §2.1–2.3).

No school/tenant code field here — this is the login for people who
manage all schools, not any one school.

### 1.2 Shell / navigation

Sidebar, gated per-item by the logged-in user's `roles`/permissions
(guide §2.7 `User.roles`, cross-reference against §3's permission column):

- **Schools** (`view-tenants`)
- **Global Users** (`view-global-users`)
- **Roles** (read-only, `view-global-users`)
- **Audit Log** (`view-audit-log`) — endpoint not implemented yet per
  guide, build the screen last / behind a "coming soon" flag
- **My Profile** (always visible)

Show the logged-in user's name + roles badge in the header. A user with
none of the above permissions (shouldn't normally happen for this portal)
sees only their profile.

### 1.3 Schools list

Table: `code`, `name`, `status` (badge: active/disabled), `provisioningStatus`
(badge: pending/provisioning/provisioned/failed), `createdAt`. Search +
pagination per guide §1 conventions. Row actions gated by permission:

- **View** → detail page
- **Deactivate/Activate** (`change-tenant-status`) — confirm dialog,
  explains this blocks that school's staff from logging in
- **Provision** (`provision-tenant`) — only shown when `provisioningStatus`
  is `pending` or `failed`; see 1.5 below

Primary button: **New School** (`create-tenant`) → creation form.

### 1.4 School detail page

Header: name, code, status/provisioning badges. Tabs:

- **Overview** — all `Tenant` object fields (guide §3 "The Tenant object"),
  editable via a form calling `POST /tenants/{code}` (`update-tenant`).
  **Never render a `database_password` field, even blank/disabled — the
  API never returns it, don't invent a field that implies it could.**
- **Responsible Officers** — list of attached global users
  (`assign-tenant-admin`), add/remove via the `/tenants/{tenant}/admins`
  endpoints.
- **Danger zone** — Deactivate/Delete, behind explicit confirmation
  modals that restate the consequence in plain language ("Staff at this
  school will immediately be unable to log in").

### 1.5 Create School flow

Two-step, because creating the record and provisioning its real database
are separate API calls (guide §3.1):

1. **Step 1 — Create record**: form for `name`, `name_ar?`, `code`,
   `contact_email?`, `contact_phone?`, `governorate?`, `address?`. Submit
   → `POST /tenants`. Result: `provisioningStatus: "pending"`, no real
   database exists yet. Redirect to the detail page.
2. **Step 2 — Provision**: a prominent "Provision this school" button/banner
   on the detail page while status is `pending`. Clicking it calls
   `POST /tenants/{code}/provision` **synchronously** (the request will
   take a few seconds — show a blocking spinner, not a background job
   indicator, since there's no polling endpoint for this). On success, the
   response contains a **one-time** Super Admin password.

   **Show that password exactly once**, in a modal with a copy-to-clipboard
   button and an explicit warning: "This password will never be shown
   again. Copy it now and send it securely to the school." Do not persist
   it anywhere client-side (no localStorage, no auto-save draft) beyond the
   current render. Closing the modal without copying is unrecoverable —
   say so before they close it.

   On failure (422 from an already-provisioned tenant retried, or a
   genuine provisioning error), show the error message returned and let
   them retry — provisioning is idempotent server-side.

### 1.6 Global Users

Standard CRUD table (`view-global-users`): name, email, roles (badges),
status. **Create** (`create-global-user`, global-admin only) and
**Sync roles** (`assign-global-role`, global-admin only) are visibly
restricted to global-admin — grey out/hide those actions for an
`admin-officer`/`reviewer` viewing this screen rather than letting them
click into a 403.

Role picker on the sync-roles screen must only list the three global
roles (`global-admin`, `admin-officer`, `reviewer`) — never mix in tenant
role names; the API rejects them but the UI shouldn't offer them.

### 1.7 Profile

`GET/POST /auth/profile`, password change, avatar upload/remove — standard
account settings screen, per guide §2.8.

---

## 2. School Portal

### 2.1 Login

Three fields: **school code**, email, password → `POST /api/v1/school/auth/login`
(guide §5.2). The school code is the one and only place a user of this
portal ever types their school's identifier — after login, never show a
"switch school" control; one login session is scoped to exactly one
school for its entire lifetime.

On 401 (bad credentials / unknown code / inactive school): one generic
error message — do not reveal whether the code exists or the account
does, to avoid enumerating school codes.

### 2.2 Shell / navigation

Sidebar, gated by the four tenant roles (guide §5.1) — fetch `me` on load
and cache `roles`/`permissions` for the session:

| Role | Sees |
|---|---|
| `school-super-admin` | Everything below, including Staff Accounts |
| `school-admin` | Everything except Staff Accounts |
| `school-teacher` / `school-data-entry` | Students, Results, Imports, Reports — no Academic Structure editing, no Staff Accounts |

- **Dashboard** (Reports summary)
- **Academic Structure** (years, stages, grades, classrooms, subjects) —
  read-only list for teacher/data-entry, full CRUD for admin/super-admin
- **Students**
- **Results**
- **Imports**
- **Reports**
- **Staff Accounts** — super-admin only, hide entirely for the other three
  roles rather than showing a disabled menu item
- **My Profile / Logout**

Header shows the school name (`me.school.name`) so a user never confuses
which school's data they're looking at, plus their own name + role badge.

### 2.3 Academic Structure

Five sub-tabs, same pattern for each — table + create/edit drawer,
following guide §5.3's field lists exactly (e.g. Classrooms need a
`grade_id` + `academic_year_id` picker, Subjects show `max_score`/
`pass_score`). `POST/PUT/DELETE` disabled (hidden, not greyed) for
teacher/data-entry.

No screen for Exam Periods — guide §5.3 notes there's no endpoint for it
yet; if exam periods are needed for a dropdown elsewhere (Results, Imports)
that selector cannot be built until that endpoint exists. Flag this
explicitly to backend rather than working around it with a hardcoded list.

### 2.4 Students

- **List**: search (code/national ID/name) + pagination (guide §5.4).
- **Create/Edit** drawer: fields per §5.4. `DELETE` only visible for
  admin/super-admin.
- **Detail page**: student info + **Enrollment history** table (academic
  year, grade, classroom, enrolled date) with an "Enroll" button opening a
  form (`academic_year_id`, `grade_id`, `classroom_id`). This is the only
  place grade/classroom assignment happens — there is deliberately no
  "grade" field on the student edit form itself, since it's tracked as
  enrollment history, not a static attribute.

### 2.5 Results

This is the most stateful screen — model the workflow explicitly rather
than a generic CRUD table:

- **List**: filter by exam period, classroom, subject, status (guide
  §5.5). Status shown as a colored badge:
  `draft` (grey) → `submitted` (blue) → `under_review` (amber) →
  `approved` (green) / `rejected` (red) → `published` (dark green).
- **Entry form**: `student_enrollment_id`, `subject_id`, `exam_period_id`,
  `score`, `max_score`, `is_absent`. This upserts — submitting the same
  student+subject+exam-period combination again edits the existing
  `draft`, it does not create a duplicate. Communicate this in the UI
  (e.g. "editing existing draft" banner) rather than letting it look like
  silent duplicate-prevention magic.
- **Detail page**: current status + full transition history (`transitions`
  from `GET /results/{id}`) rendered as a timeline (who changed what, when,
  optional `reason`).
- **Transition actions**: buttons for only the *legal next* transitions
  from the current status (guide §5.5's state diagram) —
  `draft`→`submitted`, `submitted`→`under_review`, `under_review`→
  `approved`/`rejected`, `rejected`→`draft`, `approved`→`published`.
  Approve/reject/publish buttons only rendered for `school-super-admin`/
  `school-admin` (teachers can only submit). A `reason` field is required
  in the UI for `rejected` (the API allows omitting it but the guide notes
  it's expected in practice — make it a required field client-side, not
  just a suggestion).
- Never show a free-text "set status to..." dropdown with all statuses —
  that implies transitions the backend will reject with a 422; the UI's
  job is to only ever offer legal moves.

### 2.6 Excel Import (preview → mapping → confirm)

There is **no fixed template** and no template download — schools upload
their own real sheets. Full flow: `docs/frontend-grading-import.md` §5.

- **Upload**: file picker (`.xlsx`/`.xls`/`.csv`, 10MB max) +
  `academic_year_id` + `exam_period_id` → `POST /result-imports/preview`.
- **Mapping** (always shown after preview, never auto-skipped): for each
  detected sheet subject, show `sheetName`, `gradingType` stamp, column
  letters/labels, and a subject picker filtered to the same `grading_type`,
  defaulting to `suggestedSubjectId` (or empty when null). Allow leaving a
  subject unmapped to skip it. Sample `previewRows` beside the controls.
- **Confirm**: `POST /result-imports/{id}/confirm` with
  `{ sheet_index, subject_id }` integers only.
- **Report**: student-level summary
  (`valid_rows` of `total_rows`; `invalid_rows` need attention) plus
  `imported_rows` as individual subject results. Errors table with
  expandable `row_payload`. Per-cell import — not all-or-nothing.
- **History**: no list-all endpoint; `GET /result-imports/{id}` only.

Error code → label mapping for the table:
| Code | Label |
|---|---|
| `duplicate_row` | Duplicate row in this file |
| `unknown_student` | Student code not found |
| `not_enrolled` | Student not enrolled for the selected academic year |
| `invalid_score` | Score is not a number or a recognised absence marker |
| `invalid_rating` | Unrecognised qualitative rating text |

### 2.7 Reports

`GET /reports/summary?exam_period_id=` (guide §5.7) — an exam-period
picker driving one dashboard: overall pass rate/average as headline
stat cards, a per-grade breakdown table/bar chart. Caption explicitly:
"Only published results are counted" — results still in draft/submitted/
under_review will not move these numbers, and this is computed live on
every load (no cached "as of" timestamp to show).

### 2.8 Staff Accounts (super-admin only)

Per guide §5.8:

- **List**: search (name/email/employee code) + pagination.
- **Create**: name, email, password, phone?, employee_code?, national_id?,
  and a **multi-select** for roles (the four tenant role names) — required,
  at least one. Show role descriptions inline (reuse the table from §2.2
  above) so the super-admin understands what each role can do before
  assigning it.
- **Edit**: same fields minus email (not editable per the API), password
  optional (leave blank to keep current), status toggle (active/suspended).
- **Sync roles**: a dedicated action (not folded into the edit form) since
  it **replaces** the role set rather than merging — make this explicit
  in the UI ("Save roles" button on a standalone role-multi-select, with
  the current roles pre-checked, not an "add role" plus button that would
  imply additive behavior).
- **Delete**: confirm dialog. If the target is the currently logged-in
  user, disable the delete button entirely (with a tooltip explaining why)
  rather than letting them submit and get the 422 back.
- New accounts are active immediately with no email verification —
  don't build a "pending verification" state for this screen, unlike the
  global portal's registration flow.

---

## 3. Cross-cutting UI rules

- **Response envelope**: every success is `{success:true, message, data}`
  and every error is `{success:false, message, data}` (guide §1, and now
  actually true for framework-level errors too — 401/403/404/422/429/500
  all follow this shape after the `bootstrap/app.php` exception-handling
  fix). Build one API client wrapper that unwraps `data` and throws/returns
  `message` on `success:false` — do not special-case error parsing per
  endpoint.
- **Validation errors** (422): render `data` as field-level errors under
  each form field by matching key names (they're snake_case even though
  success responses are camelCase — guide's casing note, §6). Don't assume
  a field name casing convention holds across both directions.
- **Pagination**: standard `data.data`/`data.meta`/`data.links.next` shape
  (guide §1) — build one paginated-table component, not one per screen.
- **Rate limiting** (429): surface the `Retry-After` header as "try again
  in N seconds," not a generic error toast — this will realistically hit
  during rapid double-clicks on submit buttons, so debounce/disable
  buttons on submit as the first line of defense.
- **Localization**: send `Accept-Language: en` or `ar` per guide — plan
  for RTL layout on `ar` from the start for the School Portal in
  particular (its primary users are Egyptian school staff).
- **Never build a unified login** across the two portals, and never store
  both portals' tokens under the same storage key — a stale global-admin
  token must never be sent to a `/school/*` endpoint or vice versa.
