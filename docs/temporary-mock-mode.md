# Temporary mock mode

The portals currently run against an **in-browser backend** instead of the real
API, so the whole product can be demonstrated end to end without a server.

## Switching it off

`src/lib/env.ts` reads one flag:

```
VITE_MOCK_API=false   # in .env.local — hands the portals back to the real API
```

It is **on by default**. `src/main.tsx` installs the interceptor before the
first render, so no request escapes to the network while it is on. Everything
else — the API clients, the query hooks, the screens — is unchanged and keeps
calling the same endpoints.

## What is temporarily hidden

Two school-portal screens are hidden from the navigation and their routes
redirect to the dashboard. The screen files are still on disk, so restoring
them is a matter of putting their nav entries and routes back.

- **الهيكل الدراسي** — `/school/academics`
- **فترات الامتحان** — `/school/exam-periods`

In their place, every filter now picks **الترم** (الترم الأول / الترم الثاني)
and **الصف** directly.

## What exists in the mock data

- **Grades**: الرابع، الخامس، السادس الابتدائي only (`grade-4|5|6`).
- **Terms**: `term-1` الترم الأول, `term-2` الترم الثاني.
- **Subjects**: the 13 columns printed on `src/templates/grades(4-5-6).html` —
  nine graded out of 100 (pass 50, except **التربية الدولية** which passes at
  70) and four pass/fail ones (توكاتسو، التربية البدنية والصحية، التربية
  الفنية، التربية العقلية و الموسيقية), which are recorded as **اجتياز / لم
  يجتز**, never as a number.
- **Schools**: three seeded, plus every school created from the admin portal.
- **Students**: 72 per school (2 classrooms × 12 students × 3 grades), with a
  mark in every subject for both terms.

`src/mocks/curriculum.ts` is the single source of truth for all of the above.
The XLSX template, the import parser, the reports and the printed extract all
read it, so they cannot drift apart.

## Signing in

**Admin (management) portal** — `/admin/login`: any non-empty email and
password is accepted.

**School portal** — `/school/login`, for the seeded schools:

| School | Email | Password |
| --- | --- | --- |
| مدرسة النيل الابتدائية | `admin_SCH-NILE01@pp.com` | `Password123!` |
| مدرسة الأمل الابتدائية المشتركة | `admin_SCH-AMAL02@pp.com` | `Password123!` |
| مدرسة طه حسين الابتدائية | `admin_SCH-TAHA03@pp.com` | `Password123!` |

A school created from the admin portal accepts **either** its generated
composite login (`admin_<CODE>@pp.com`) **or** the plain address typed on the
create form, with the password chosen there.

## Uploading results

1. School portal → **الاستيراد**, pick a term and a grade.
2. **تنزيل قالب النتائج** downloads an `.xlsx` already filled with that
   grade's roster and a plausible mark in every subject column.
3. Upload the same file back. It imports cleanly — the sheet's column names are
   generated from the same curriculum module the parser matches against.

Marks land as `published`, so they appear in the reports and in the management
portal immediately. The uploaded marks replace the seeded ones for those
students, subjects and term.

## Where the data lives

`localStorage` under `edara.mock.v1`, and only what actually changed — created
schools, hand-added students, uploaded marks and import runs. Rosters and
seeded marks are derived from the school code, so they are identical on every
reload and in every browser.

To start over, run `edaraMockReset()` in the browser console.
