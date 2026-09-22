# Dynamic Result Import — Frontend Guide

Everything about getting student results out of a school's own Excel/CSV
sheet and into the system lives in this one file: why a naive fixed-column
importer doesn't work for this domain, the grading model it has to
respect, the onboarding tool that populates a school's subjects in the
first place, and the exact two-step import API a frontend needs to build
against.

---

## 1. Why this isn't a simple "upload a CSV" feature

The original design assumed a flat template: one row per (student,
subject), three columns (`student_code`, `subject_code`, `score`). Real
sheets — inspected directly, six real files spanning grades 1 through 6
from one school — broke every part of that assumption:

1. **Column layout is not standardized, not even within one school.**
   Every grade had a different subject list and column count (7 subjects
   in grade 3, 15+ in grade 4), and the school's own admin confirmed
   directly that the **same school won't necessarily send the same shape
   twice** — there is no fixed template to hard-code against, ever.
2. **Not every subject is graded with a number** — see §2.
3. **A subject's score is itself often split into components**
   (`اعمال` coursework / `نصف العام` midterm / `اجمالي` total) as three
   separate columns feeding one grade, with several metadata rows
   (governorate/administration/school name, then a "max score per
   component" reference row) sitting above the real student data.
4. **Absence is marked as text inside a score cell** (`غ`, `غياب`, or a
   raw `#VALUE!` Excel formula error) — a real, expected outcome, not bad
   data to reject.

Given all this, the only workable design is: **every upload is previewed
and its column-to-subject mapping is confirmed by a human before anything
is written** — never a blind "detect and import" in one step, and never a
"save a mapping once and trust it forever" shortcut either, since the
shape can change between uploads from the same school.

---

## 2. The grading model: numeric vs. qualitative subjects

Egyptian primary schools don't grade every subject with a number.
"Skill" subjects — Tokatsu (توكاتسو), multidisciplinary studies,
"advanced level," PE, art, music — are assessed on a four-band
**descriptive** scale instead. 1st and 2nd grade use this descriptive
scale for *every* subject (no numeric exams exist for those two grades at
all); from 3rd grade up it applies only to those specific skill subjects
— core academic subjects (Arabic, English, Math, Religion, Science,
Social Studies...) are still scored numerically. This is **per-subject,
not per-grade** — a single grade mixes both kinds.

### `Subject.grading_type`

One of `"numeric"` or `"qualitative"` (guide §5.3):

- **`numeric`** — `score` out of `max_score`, compared against
  `pass_score`.
- **`qualitative`** — no numeric score at all; `max_score`/`pass_score`
  are `null`. The result carries a `qualitative_rating` instead.

**Frontend impact — Academic Structure screen:** the Subject create/edit
form needs a `grading_type` toggle; when `qualitative` is selected, hide
`max_score`/`pass_score` entirely (the API rejects them for this type).
Anywhere a subject is listed (results entry, imports, reports), branch UI
on `grading_type` rather than assuming every subject behaves the same way.

### `Result.qualitative_rating`

Populated **instead of** `score`/`max_score` when the subject is
qualitative. One of four fixed values, matching the Ministry's own scale:

| Value | Arabic label | Color | Percentage band (if derived from a number) |
|---|---|---|---|
| `exceeds_expectations` | يفوق التوقعات | Blue | 85–100 |
| `meets_expectations` | التوقعات | Green | 65–85 |
| `sometimes_meets_expectations` | أحيانا التوقعات | Yellow | 50–65 |
| `below_expectations` | أقل من التوقعات | Red | 1–50 |

"اجتاز" (Passed) on a printed transcript is not a fifth value — it's
derived: any rating except `below_expectations` counts as a pass.

**Frontend impact — Results screen:** the result entry form must branch
on `subject.grading_type` — numeric subjects show the existing
`score`/`is_absent` fields; qualitative subjects show a **4-option
picker** (styled with the color, not just text — schools think of these
as colors first) instead of a number input. Anywhere a result is
displayed, render `qualitative_rating` as a colored badge using the color
column above, falling back to the numeric display otherwise. The results
list filter (`?status=`) is unaffected — workflow status is orthogonal to
grading type.

---

## 3. Onboarding: seeding a school's subjects from its real sheet

Before any result can be imported, the school needs `Subject` records to
map sheet columns onto. Rather than typing every subject in by hand
through the Academic Structure UI, there's a one-time backend step that
reads a school's **own real result sheet** and creates matching `Subject`
rows automatically — including the correct `grading_type`, detected from
the actual data (not guessed from the name):

```
php artisan school:seed-academics {tenant_code} {file_path} --stage="..." --grade="..."
```

This is currently a **backend-operated CLI command** — there is no
frontend-facing endpoint for it yet. Worth knowing anyway because:

- A newly provisioned school's subject list may already be populated from
  this step — don't assume Academic Structure always starts empty.
- It shares its detection logic (§4's `ResultSheetParser`) with the import
  feature below, so a subject this step created is exactly what the
  import mapping step will try to match sheet columns against — the two
  features are two consumers of one shared reader.

If a "trigger seeding from a file upload" endpoint gets built later, this
doc will be updated with its shape; until then, always fetch a school's
subject list (`GET /academic-years` etc., guide §5.3) rather than
assuming it's empty or populated.

---

## 4. The backend piece that makes import possible

`Modules\School\app\Services\ResultSheetParser` is a **reader, not an
importer** — given a file, it figures out:

- Which row is the real header (skipping metadata rows above it) — found
  by scanning for a recognizable "seating number" (`جلوس`) or "name"
  (`الاسم`) label. Text is normalized to strip Arabic tatweel/kashida
  stretching (`الاســـــم` → `الاسم`) first, since some sheets visually
  justify header text that way and it breaks substring matching otherwise.
- Whether there's a second header row splitting each subject into named
  components (`اعمال`/`نصف العام`/`اجمالي`, or `ترم اول`/`ترم ثان`).
- Where each subject's column block starts and ends, by walking the
  header row and treating a blank cell as "still part of the previous
  merged subject header."
- Where the **real data actually starts** — some sheets insert a "max
  score per component" reference row (e.g. `40 | 60 | 100`) directly
  below the header, with a blank student code; the parser detects and
  skips it by looking for the first row where the student-code column is
  actually non-blank.
- **Whether each subject is numeric or qualitative — from the actual data,
  not the subject's name.** It samples real cells (preferring the
  `اجمالي` column when a component breakdown exists, since a sheet can
  legitimately put a plain number in `نصف العام` as a weight/placeholder
  even for a qualitative subject — `اجمالي` is always the real final
  grade). A number or a recognized absence marker counts as numeric
  evidence; anything else (`يفوق`, `اجتاز`...) counts as qualitative
  evidence.

Both §3's seeding command and §5's import endpoints below share this one
implementation rather than duplicating header-detection logic.

---

## 5. The two-step import API

### Step 1 — `POST /api/v1/school/result-imports/preview`

Multipart form: `file` (.xlsx/.xls/.csv, max 10MB), `academic_year_id`,
`exam_period_id`. Nothing is written to the database yet.

```json
{
  "success": true,
  "message": "Preview ready",
  "data": {
    "resultImportId": 1,
    "sheet": " 3ب كامل  ت1 ",
    "idColumns": { "serial": "A", "student_code": "B", "student_name": "C", "classroom": "D" },
    "subjects": [
      {
        "sheetIndex": 0,
        "sheetName": "لغة عربية",
        "gradingType": "numeric",
        "columns": { "E": "اعمال", "F": "نصف العام", "G": "اجمالي" },
        "suggestedSubjectId": 1,
        "suggestedSubjectName": "لغة عربية"
      },
      {
        "sheetIndex": 5,
        "sheetName": "متعدد التخصصات",
        "gradingType": "qualitative",
        "columns": { "T": "نصف العام", "U": "اجمالي" },
        "suggestedSubjectId": 6,
        "suggestedSubjectName": "متعدد التخصصات"
      }
    ],
    "previewRows": [ { "A": "1", "B": "3001", "C": "...", "E": "40", "F": "60", "G": "100", ... } ]
  }
}
```

- `subjects` is every subject block the parser found in the sheet, each
  with a `suggestedSubjectId` — matched against this school's existing
  `Subject` records (§3) by normalized name equality first, then
  substring containment either direction. **This is only ever a
  pre-filled suggestion.** `suggestedSubjectId` is `null` when nothing
  matched (a genuinely new subject, or a name too different to guess) —
  the UI must let the operator pick manually in that case, or go create
  the subject first (guide §5.3) if it truly doesn't exist yet.
- `previewRows` is a handful of real data rows (raw, unprocessed) so the
  UI can render "here's what we found" next to the mapping controls.
- **The mapping UI must always be shown, even when every suggestion looks
  correct** — never skip straight to import. This isn't just caution:
  since layout varies between uploads from the same school, an
  auto-accepted suggestion this time is not a guarantee of correctness
  next time.

### Step 2 — Mapping confirmation screen (client-side, no API call)

For each entry in `subjects`, show: the sheet's own subject name
(`sheetName`), its detected grading type (`gradingType` — numeric vs.
qualitative, since a qualitative subject shouldn't be offered a numeric
subject as a mapping target), and a picker defaulting to
`suggestedSubjectId` that the operator can change to any other existing
subject of the same grading type, or leave unmapped to skip that column
entirely (don't force every detected column to be mapped — a school might
intentionally exclude one).

### Step 3 — `POST /api/v1/school/result-imports/{resultImportId}/confirm`

```json
{
  "mapping": [
    { "sheet_index": 0, "subject_id": 1 },
    { "sheet_index": 5, "subject_id": 6 }
  ]
}
```

**Only `sheet_index` (the exact number from step 1's `subjects` array)
and `subject_id` are sent — never column letters or the sheet's Arabic
subject name text.** This is deliberate, not a style choice: column
values/labels for a given `sheet_index` are re-read from what the backend
itself detected and stored at preview time, not from whatever the client
echoes back. Round-tripping Arabic label strings (e.g. `"اجمالي"`)
through client JSON is a real, demonstrated failure mode — two
byte-for-byte-different-looking-identical Unicode sequences can compare
unequal, silently causing the wrong column to be read. Sending only
integers sidesteps this entirely.

**200** →
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "id": 1,
    "status": "completed",
    "total_rows": 207,
    "valid_rows": 205,
    "invalid_rows": 2,
    "imported_rows": 1640,
    "errors": [
      { "row_number": 8, "error_code": "unknown_student", "error_message": "Student code not found", "row_payload": { "B": "3002", ... } }
    ]
  }
}
```

- `imported_rows` counts **individual subject results**, not students —
  importing 205 valid students × 8 mapped subjects each gives up to 1640,
  not 205. `valid_rows`/`invalid_rows` count students (a student counts as
  invalid if any one of their mapped subjects failed).
- Valid subjects for an otherwise-fine student are still imported even if
  one of that student's other subjects has an error — this is per-cell,
  not all-or-nothing. Word any summary UI accordingly ("205 of 207
  students imported; 2 need attention below," not "import failed").
- Calling `confirm` twice on the same `resultImportId` is rejected (422,
  `"This import has already been confirmed."`) — there is no "re-run" on
  the same upload; start a new `preview` if you need to.

### Error codes

| Code | Meaning |
|---|---|
| `duplicate_row` | The same student code appears more than once in the sheet |
| `unknown_student` | `student_code` doesn't exist in this school's own `students` table |
| `not_enrolled` | Student exists but has no enrollment for the selected `academic_year_id` |
| `invalid_score` | A numeric subject's cell isn't a number and isn't a recognized absence marker |
| `invalid_rating` | A qualitative subject's cell text isn't one of the recognized rating labels (see below) — this is expected to happen sometimes; the Ministry's vocabulary isn't perfectly standardized across sheets, so don't treat this as a bug report, just show it as an actionable per-row error |

### Absence handling

A cell containing `غ`, `غياب`, or a raw `#VALUE!` (an Excel formula error
some sheets leave behind for absent students) is treated as **the student
was absent for that subject** — `is_absent: true`, `score`/
`qualitative_rating` both `null` — never as an `invalid_score`/
`invalid_rating` error.

### Recognized qualitative rating text

| Sheet text | Maps to |
|---|---|
| `يفوق`, `يفوق التوقعات` | `exceeds_expectations` |
| `متمكن`, `التوقعات`, `اجتاز`, `ناجح` | `meets_expectations` |
| `أحيانا التوقعات`, `احيانا التوقعات` | `sometimes_meets_expectations` |
| `يحتاج دعم`, `أقل من التوقعات`, `اقل من التوقعات`, `لم يجتاز`, `راسب` | `below_expectations` |

Note `اجتاز` (a bare "passed," with no indication of which band) maps to
the lowest *passing* band rather than being guessed higher — it's real
information ("this student passed"), just not precise information, and
the mapping doesn't invent precision that isn't there.

---

## 6. What this replaces

The previous `POST /result-imports` (single-step, fixed
`student_code`/`subject_code`/`score` columns) is gone. If any code still
calls it, it will 404 — the two-step `preview`/`confirm` flow above is the
only import path now.

## 7. What's still not built

- **Saved templates.** Nothing remembers a school's previous mapping to
  pre-fill next time beyond the automatic name-based suggestion — every
  upload starts from a fresh name match. This is intentional for now
  (the school's own admin confirmed shape can vary upload-to-upload), but
  a "start from last time's mapping, still review it" convenience could
  be added later without changing the API contract above.
- **Import history list.** `GET /result-imports/{id}` (unchanged) re-fetches
  one import's report, but there's no "list all past imports" endpoint —
  track `resultImportId`s client-side per session if a history view is
  needed, or ask backend to add one.
- **Bulk subject creation from an unmatched sheet column.** If
  `suggestedSubjectId` is `null` because the subject genuinely doesn't
  exist yet, the operator currently has to go create it manually via the
  Academic Structure screen (guide §5.3) before they can map to it in the
  same import session — there's no "create this subject inline" shortcut
  in the mapping UI yet.
- **A frontend-facing endpoint for §3's seeding tool.** It's CLI-only
  today; there's no way to trigger it from the admin UI.

---

## 8. Related but separate: printable official documents

Not part of import, but the same real-sheet research surfaced it: the
actual business goal behind grading data is that a parent can get a
printed بيان قيد (enrollment certificate) or مستخرج رسمي بنتيجة الصف
(official result transcript). The backend hands over data via existing
student/result endpoints; the frontend renders and prints it. No dedicated
certificate endpoint exists yet.
