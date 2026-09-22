/** School-portal endpoints, served from the in-browser database. */

import {
  GRADES,
  gradeById,
  subjectsForGrade,
  allSubjects,
  ratingFromCell,
  termById,
} from '../curriculum'
import {
  ACADEMIC_YEARS,
  CLASSROOMS,
  CURRENT_YEAR_ID,
  EXAM_PERIODS,
  STAGE,
  addStudent,
  classroomById,
  fullName,
  isPass,
  listImports,
  recordImport,
  replaceStudent,
  resultById,
  resultRows,
  schoolByCode,
  schoolByLogin,
  studentById,
  studentByCode,
  studentStats,
  studentsOf,
  termIdOfPeriod,
  writeResult,
  writeResults,
  type MockSchool,
  type MockStudent,
  type ResultRow,
} from '../db'
import { rng } from '../random'
import { parseSheet, type ParsedSheet } from '../sheet-parser'
import {
  asRecord,
  asString,
  fail,
  invalid,
  noContent,
  ok,
  paginate,
  route,
  type MockRequest,
  type MockResult,
  type Route,
} from '../http'

/* ---------------------------------------------------------------- session */

const TOKEN_PREFIX = 'mock-school-token.'

export const schoolTokenFor = (code: string) => `${TOKEN_PREFIX}${code}`

/** The signed-in school is carried in the bearer token, as the real API does. */
function currentSchool(request: MockRequest): MockSchool | null {
  const header = request.headers.get('Authorization') ?? ''
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token.startsWith(TOKEN_PREFIX)) return null
  return schoolByCode(token.slice(TOKEN_PREFIX.length))
}

const UNAUTHENTICATED = fail(401, 'انتهت الجلسة. سجّل الدخول من جديد.')

/** Wraps a handler so it always has a school in hand. */
const scoped =
  (handler: (school: MockSchool, request: MockRequest) => MockResult | Promise<MockResult>) =>
  (request: MockRequest) => {
    const school = currentSchool(request)
    return school ? handler(school, request) : UNAUTHENTICATED
  }

/* ------------------------------------------------------------------ users */

const STAFF_ROLES = [
  'school-super-admin',
  'school-admin',
  'school-teacher',
  'school-data-entry',
] as const

const STAFF_NAMES = ['مدير المدرسة', 'وكيل المدرسة', 'أ. سعاد المعلمة', 'أ. هاني مدخل البيانات']

function staffOf(school: MockSchool) {
  return STAFF_ROLES.map((role, index) => {
    const random = rng(`${school.code}:staff:${index}`)
    return {
      id: `${school.code}.user${index + 1}`,
      name: STAFF_NAMES[index],
      email: index === 0 ? school.login.email : `${role}_${school.code}@pp.com`.toLowerCase(),
      phone: `012${Math.floor(random() * 90000000 + 10000000)}`,
      status: 'active' as const,
      roles: [role],
      createdAt: school.createdAt,
    }
  })
}

const PERMISSIONS = [
  'view-students',
  'create-student',
  'update-student',
  'delete-student',
  'view-results',
  'create-result',
  'transition-result',
  'import-results',
  'view-reports',
  'manage-staff',
]

/* -------------------------------------------------------------- mappings */

const toApiStudent = (student: MockStudent) => ({
  id: student.id,
  student_code: student.student_code,
  seat_no: student.seat_no,
  national_id: student.national_id,
  first_name: student.first_name,
  father_name: student.father_name,
  family_name: student.family_name,
  gender: student.gender,
  birth_date: student.birth_date,
  guardian_name: student.guardian_name,
  guardian_phone: student.guardian_phone,
  status: student.status,
  grade_id: student.grade_id,
  classroom_id: student.classroom_id,
  enrollments: [enrollmentOf(student)],
})

const enrollmentOf = (student: MockStudent) => ({
  id: `${student.id}.enr`,
  academic_year_id: CURRENT_YEAR_ID,
  grade_id: student.grade_id,
  classroom_id: student.classroom_id,
  enrolled_on: ACADEMIC_YEARS[0].starts_on,
  classroom: classroomById(student.classroom_id),
  academic_year: ACADEMIC_YEARS[0],
})

const toApiResult = (row: ResultRow) => ({
  id: row.id,
  student_enrollment_id: `${row.student.id}.enr`,
  student_id: row.student.id,
  subject_id: row.subject.id,
  exam_period_id: `${CURRENT_YEAR_ID}.${row.termId}`,
  term_id: row.termId,
  grade_id: row.student.grade_id,
  classroom_id: row.student.classroom_id,
  score: row.value.score,
  max_score: row.subject.max_score,
  pass_score: row.subject.pass_score,
  grading_type: row.subject.grading_type,
  qualitative_rating: row.value.qualitative_rating,
  is_absent: row.value.is_absent,
  status: row.value.status,
  reason: null,
  passed: isPass(row.subject, row.value),
  student_name: fullName(row.student),
  student_code: row.student.student_code,
  subject_name: row.subject.name,
  transitions: [
    {
      id: `${row.id}.t1`,
      from_status: null,
      to_status: row.value.status,
      reason: null,
      causer_name: 'استيراد النتائج',
      created_at: row.value.updatedAt,
    },
  ],
})

/* ------------------------------------------------------------ reference */

const referenceRows = (resource: string, query: URLSearchParams): unknown[] => {
  switch (resource) {
    case 'academic-years':
      return ACADEMIC_YEARS
    case 'educational-stages':
      return [STAGE]
    case 'grades': {
      return GRADES.map((grade) => ({
        id: grade.id,
        educational_stage_id: STAGE.id,
        code: grade.code,
        name: grade.name,
        level: grade.level,
      }))
    }
    case 'classrooms': {
      const gradeId = query.get('grade_id')
      return CLASSROOMS.filter((room) => !gradeId || room.grade_id === gradeId)
    }
    case 'subjects': {
      const gradeId = query.get('grade_id')
      return gradeId ? subjectsForGrade(gradeId) : allSubjects()
    }
    default:
      return []
  }
}

/* --------------------------------------------------------------- imports */

type ImportOutcome = {
  report: ReturnType<typeof recordImport>
  writes: { studentId: string; subjectId: string; termId: string; value: { score: number | null; qualitative_rating: string | null; is_absent: boolean; status: 'published' } }[]
}

/**
 * Reads a filled template back in. The sheet's subject columns are matched by
 * their printed name, which is exactly what the downloadable template writes,
 * so a round trip always lands cleanly.
 */
function applySheet(
  school: MockSchool,
  gradeId: string,
  termId: string,
  fileName: string,
  sheet: ParsedSheet,
): ImportOutcome {
  const subjects = subjectsForGrade(gradeId)
  const byName = new Map(subjects.map((subject) => [subject.name.trim(), subject]))
  const errors: { row_number: number; error_code: string; error_message: string; row_payload: Record<string, unknown> }[] = []
  const writes: ImportOutcome['writes'] = []
  const seen = new Set<string>()

  let validRows = 0

  sheet.rows.forEach((row, index) => {
    const rowNumber = index + 2
    const code = String(row['كود الطالب'] ?? row['student_code'] ?? '').trim()
    const student = code ? studentByCode(school.code, code) : null

    if (!student) {
      errors.push({
        row_number: rowNumber,
        error_code: 'unknown_student',
        error_message: `لا يوجد طالب بالكود ${code || '—'}`,
        row_payload: row,
      })
      return
    }

    if (student.grade_id !== gradeId) {
      errors.push({
        row_number: rowNumber,
        error_code: 'not_enrolled',
        error_message: 'الطالب غير مقيّد بهذا الصف.',
        row_payload: row,
      })
      return
    }

    if (seen.has(student.id)) {
      errors.push({
        row_number: rowNumber,
        error_code: 'duplicate_row',
        error_message: 'تكرار الطالب داخل الملف.',
        row_payload: row,
      })
      return
    }
    seen.add(student.id)

    const rowWrites: ImportOutcome['writes'] = []
    let rowFailed = false

    for (const [header, subject] of byName) {
      const cell = String(row[header] ?? '').trim()
      if (cell === '') continue

      if (subject.grading_type === 'numeric') {
        const score = Number(cell.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))))
        if (!Number.isFinite(score) || score < 0 || score > (subject.max_score ?? 100)) {
          rowFailed = true
          errors.push({
            row_number: rowNumber,
            error_code: 'invalid_score',
            error_message: `درجة غير صالحة في «${subject.name}»: ${cell}`,
            row_payload: row,
          })
          continue
        }
        rowWrites.push({
          studentId: student.id,
          subjectId: subject.id,
          termId,
          value: { score: Math.round(score), qualitative_rating: null, is_absent: false, status: 'published' },
        })
        continue
      }

      const rating = ratingFromCell(cell)
      if (rating === null) {
        rowFailed = true
        errors.push({
          row_number: rowNumber,
          error_code: 'invalid_rating',
          error_message: `تقدير غير صالح في «${subject.name}»: ${cell}`,
          row_payload: row,
        })
        continue
      }
      rowWrites.push({
        studentId: student.id,
        subjectId: subject.id,
        termId,
        value: { score: null, qualitative_rating: rating, is_absent: false, status: 'published' },
      })
    }

    writes.push(...rowWrites)
    if (!rowFailed) validRows += 1
  })

  writeResults(writes)

  const report = recordImport({
    schoolCode: school.code,
    gradeId,
    termId,
    fileName,
    status: 'completed',
    total_rows: sheet.rows.length,
    valid_rows: validRows,
    invalid_rows: sheet.rows.length - validRows,
    imported_rows: writes.length,
    errors,
  })

  return { report, writes }
}

const toApiReport = (run: ReturnType<typeof recordImport>) => ({
  id: run.id,
  status: run.status,
  file_name: run.fileName,
  grade_id: run.gradeId,
  term_id: run.termId,
  total_rows: run.total_rows,
  valid_rows: run.valid_rows,
  invalid_rows: run.invalid_rows,
  imported_rows: run.imported_rows,
  errors: run.errors,
  created_at: run.createdAt,
})

/* ---------------------------------------------------------------- routes */

export const schoolRoutes: Route[] = [
  route('POST', '/school/auth/login', (request) => {
    const email = asString(request.body, 'email')
    const password = asString(request.body, 'password')
    const school = schoolByLogin(email)

    if (!school || school.login.password !== password) {
      return fail(401, 'بيانات الدخول غير صحيحة.')
    }

    const user = staffOf(school)[0]
    return ok(
      { user, accessToken: schoolTokenFor(school.code), tokenType: 'Bearer' },
      'تم تسجيل الدخول.',
    )
  }),

  route('POST', '/school/auth/logout', () => ok(null, 'تم تسجيل الخروج.')),

  route(
    'GET',
    '/school/me',
    scoped((school) =>
      ok({
        user: staffOf(school)[0],
        school: { code: school.code, name: school.name },
        permissions: PERMISSIONS,
      }),
    ),
  ),

  // Reference lists. Writes are accepted so nothing 405s, but the structure
  // screens are hidden for now and nothing calls them.
  ...['academic-years', 'educational-stages', 'grades', 'classrooms', 'subjects'].flatMap(
    (resource): Route[] => [
      route('GET', `/school/${resource}`, (request) =>
        ok(referenceRows(resource, request.query)),
      ),
      route('POST', `/school/${resource}`, (request) => ok(asRecord(request.body))),
      route('PUT', `/school/${resource}/:id`, (request) =>
        ok({ id: request.params.id, ...asRecord(request.body) }),
      ),
      route('DELETE', `/school/${resource}/:id`, () => noContent()),
    ],
  ),

  route('GET', '/school/exam-periods', (request) => {
    const yearId = request.query.get('academic_year_id')
    return ok(EXAM_PERIODS.filter((period) => !yearId || period.academic_year_id === yearId))
  }),
  route('POST', '/school/exam-periods', (request) => ok(asRecord(request.body))),
  route('PUT', '/school/exam-periods/:id', (request) =>
    ok({ id: request.params.id, ...asRecord(request.body) }),
  ),
  route('DELETE', '/school/exam-periods/:id', () => noContent()),

  /* -------------------------------------------------------------- roster */

  /**
   * Everything the upload screen needs to build a template for one grade:
   * the roster in printing order plus the subject columns.
   */
  route(
    'GET',
    '/school/roster',
    scoped((school, request) => {
      const gradeId = request.query.get('grade_id') ?? ''
      const grade = gradeById(gradeId)
      if (!grade) return fail(404, 'صف غير معروف.')

      const students = studentsOf(school.code)
        .filter((student) => student.grade_id === gradeId)
        .map((student, index) => ({
          serial: index + 1,
          id: student.id,
          student_code: student.student_code,
          seat_no: student.seat_no,
          name: fullName(student),
          classroom: classroomById(student.classroom_id)?.code ?? '',
        }))

      return ok({
        school: { code: school.code, name: school.name, directorate: school.directorate, governorate: school.governorate },
        grade: { id: grade.id, name: grade.name, level: grade.level },
        subjects: subjectsForGrade(gradeId),
        students,
      })
    }),
  ),

  /* ------------------------------------------------------------ students */

  route(
    'GET',
    '/school/students',
    scoped((school, request) => {
      const search = (request.query.get('search') ?? '').trim()
      const gradeId = request.query.get('grade_id') ?? ''
      const classroomId = request.query.get('classroom_id') ?? ''

      const rows = studentsOf(school.code)
        .filter((student) => !gradeId || student.grade_id === gradeId)
        .filter((student) => !classroomId || student.classroom_id === classroomId)
        .filter(
          (student) =>
            search === '' ||
            fullName(student).includes(search) ||
            student.student_code.includes(search) ||
            student.national_id.includes(search),
        )
        .map(toApiStudent)

      return ok(paginate(rows, request.query))
    }),
  ),

  route(
    'GET',
    '/school/students/:id',
    scoped((school, request) => {
      const student = studentById(school.code, request.params.id)
      return student ? ok(toApiStudent(student)) : fail(404, 'الطالب غير موجود.')
    }),
  ),

  route(
    'POST',
    '/school/students',
    scoped((school, request) => {
      const body = asRecord(request.body)
      const code = asString(body, 'student_code')
      if (code === '') return invalid({ student_code: ['كود الطالب مطلوب.'] })
      if (studentByCode(school.code, code)) {
        return invalid({ student_code: ['هذا الكود مستخدم بالفعل.'] })
      }

      const gradeId = asString(body, 'grade_id') || GRADES[0].id
      const student = addStudent(school.code, {
        student_code: code,
        seat_no: asString(body, 'seat_no') || code,
        national_id: asString(body, 'national_id'),
        first_name: asString(body, 'first_name'),
        father_name: asString(body, 'father_name'),
        family_name: asString(body, 'family_name'),
        gender: asString(body, 'gender') === 'female' ? 'female' : 'male',
        birth_date: asString(body, 'birth_date'),
        guardian_name: asString(body, 'guardian_name'),
        guardian_phone: asString(body, 'guardian_phone'),
        status: 'active',
        grade_id: gradeId,
        classroom_id: asString(body, 'classroom_id') || `${gradeId}.c1`,
      })

      return ok(toApiStudent(student), 'تمت إضافة الطالب.')
    }),
  ),

  route(
    'PUT',
    '/school/students/:id',
    scoped((school, request) => {
      const student = replaceStudent(school.code, request.params.id, asRecord(request.body) as Partial<MockStudent>)
      return student ? ok(toApiStudent(student), 'تم حفظ التعديلات.') : fail(404, 'الطالب غير موجود.')
    }),
  ),

  route('DELETE', '/school/students/:id', () => noContent()),

  route(
    'GET',
    '/school/students/:id/enrollments',
    scoped((school, request) => {
      const student = studentById(school.code, request.params.id)
      return student ? ok([enrollmentOf(student)]) : fail(404, 'الطالب غير موجود.')
    }),
  ),

  route(
    'POST',
    '/school/students/:id/enrollments',
    scoped((school, request) => {
      const student = studentById(school.code, request.params.id)
      if (!student) return fail(404, 'الطالب غير موجود.')
      const body = asRecord(request.body)
      replaceStudent(school.code, student.id, {
        grade_id: asString(body, 'grade_id') || student.grade_id,
        classroom_id: asString(body, 'classroom_id') || student.classroom_id,
      })
      return ok(enrollmentOf(studentById(school.code, student.id) ?? student), 'تم تسجيل الطالب.')
    }),
  ),

  route(
    'GET',
    '/school/students/:id/stats',
    scoped((school, request) => {
      const stats = studentStats(school.code, request.params.id)
      return stats ? ok(stats) : fail(404, 'الطالب غير موجود.')
    }),
  ),

  /* ------------------------------------------------------------- results */

  route(
    'GET',
    '/school/results',
    scoped((school, request) => {
      const periodId = request.query.get('exam_period_id') ?? ''
      const rows = resultRows(school.code, {
        termId: periodId ? termIdOfPeriod(periodId) : (request.query.get('term_id') ?? undefined) || undefined,
        gradeId: request.query.get('grade_id') || undefined,
        classroomId: request.query.get('classroom_id') || undefined,
        subjectId: request.query.get('subject_id') || undefined,
        status: request.query.get('status') || undefined,
      })
      return ok(paginate(rows.map(toApiResult), request.query))
    }),
  ),

  route(
    'GET',
    '/school/results/:id',
    scoped((school, request) => {
      const row = resultById(school.code, request.params.id)
      return row ? ok(toApiResult(row)) : fail(404, 'النتيجة غير موجودة.')
    }),
  ),

  route(
    'POST',
    '/school/results',
    scoped((school, request) => {
      const body = asRecord(request.body)
      const studentId = asString(body, 'student_enrollment_id').replace(/\.enr$/, '')
      const subjectId = asString(body, 'subject_id')
      const termId = termIdOfPeriod(asString(body, 'exam_period_id'))
      const student = studentById(school.code, studentId)
      if (!student) return invalid({ student_enrollment_id: ['الطالب غير موجود.'] })

      const rawScore = asRecord(body).score
      writeResult(studentId, subjectId, termId, {
        score: typeof rawScore === 'number' ? rawScore : null,
        qualitative_rating: asString(body, 'qualitative_rating') || null,
        is_absent: asRecord(body).is_absent === true,
        status: 'draft',
      })

      const row = resultById(school.code, `${studentId}__${subjectId}__${termId}`)
      return row ? ok(toApiResult(row), 'تم حفظ الدرجة.') : fail(422, 'تعذّر حفظ الدرجة.')
    }),
  ),

  route(
    'POST',
    '/school/results/:id/transition',
    scoped((school, request) => {
      const row = resultById(school.code, request.params.id)
      if (!row) return fail(404, 'النتيجة غير موجودة.')
      const status = asString(request.body, 'status') as typeof row.value.status
      writeResult(row.student.id, row.subject.id, row.termId, { ...row.value, status })
      const updated = resultById(school.code, request.params.id)
      return updated ? ok(toApiResult(updated), 'تم تحديث الحالة.') : fail(404, 'النتيجة غير موجودة.')
    }),
  ),

  /* ------------------------------------------------------------- imports */

  /** One-step upload: the sheet is the template, so there is nothing to map. */
  route(
    'POST',
    '/school/result-imports',
    scoped(async (school, request) => {
      const form = request.form
      const file = form?.get('file')
      if (!(file instanceof File)) return invalid({ file: ['اختر ملف النتائج أولًا.'] })

      const gradeId = String(form?.get('grade_id') ?? '')
      const termId = String(form?.get('term_id') ?? '')
      if (!gradeById(gradeId)) return invalid({ grade_id: ['اختر الصف.'] })
      if (!termById(termId)) return invalid({ term_id: ['اختر الترم.'] })

      let sheet: ParsedSheet
      try {
        sheet = await parseSheet(file)
      } catch {
        return invalid({ file: ['تعذّرت قراءة الملف. استخدم القالب المرفق.'] })
      }

      if (sheet.rows.length === 0) {
        return invalid({ file: ['الملف لا يحتوي على أي صفوف بيانات.'] })
      }

      const missing = subjectsForGrade(gradeId)
        .map((subject) => subject.name)
        .filter((name) => !sheet.headers.includes(name))

      if (missing.length === subjectsForGrade(gradeId).length) {
        return invalid({ file: ['أعمدة المواد غير مطابقة للقالب. نزّل القالب من هذه الشاشة.'] })
      }

      const { report } = applySheet(school, gradeId, termId, file.name, sheet)
      return ok(toApiReport(report), 'تم رفع النتائج بنجاح.')
    }),
  ),

  route(
    'GET',
    '/school/result-imports',
    scoped((school, request) => ok(paginate(listImports(school.code).map(toApiReport), request.query))),
  ),

  route(
    'GET',
    '/school/result-imports/:id',
    scoped((school, request) => {
      const run = listImports(school.code).find((item) => item.id === request.params.id)
      return run ? ok(toApiReport(run)) : fail(404, 'سجل الاستيراد غير موجود.')
    }),
  ),

  /* ------------------------------------------------------------- reports */

  route(
    'GET',
    '/school/reports/summary',
    scoped((school, request) => {
      const periodId = request.query.get('exam_period_id') ?? ''
      const termId = periodId ? termIdOfPeriod(periodId) : request.query.get('term_id') ?? ''
      const rows = resultRows(school.code, { termId: termById(termId) ? termId : undefined })
      const numeric = rows.filter((row) => row.subject.grading_type === 'numeric')
      const passed = rows.filter((row) => isPass(row.subject, row.value))

      const byGrade = GRADES.map((grade) => {
        const gradeRows = rows.filter((row) => row.student.grade_id === grade.id)
        const gradeNumeric = gradeRows.filter((row) => row.subject.grading_type === 'numeric')
        return {
          grade_id: grade.id,
          total: gradeRows.length,
          passed: gradeRows.filter((row) => isPass(row.subject, row.value)).length,
          average:
            gradeNumeric.length === 0
              ? 0
              : gradeNumeric.reduce((sum, row) => sum + (row.value.score ?? 0), 0) / gradeNumeric.length,
        }
      })

      return ok({
        overall: {
          total: rows.length,
          passed: passed.length,
          average:
            numeric.length === 0
              ? 0
              : numeric.reduce((sum, row) => sum + (row.value.score ?? 0), 0) / numeric.length,
        },
        byGrade,
      })
    }),
  ),

  /* --------------------------------------------------------------- staff */

  route(
    'GET',
    '/school/users',
    scoped((school, request) => {
      const search = (request.query.get('search') ?? '').trim()
      const rows = staffOf(school).filter(
        (user) => search === '' || user.name.includes(search) || user.email.includes(search),
      )
      return ok(paginate(rows, request.query))
    }),
  ),

  route(
    'POST',
    '/school/users',
    scoped((school, request) => {
      const body = asRecord(request.body)
      return ok(
        {
          id: `${school.code}.user-new-${Date.now()}`,
          name: asString(body, 'name'),
          email: asString(body, 'email'),
          phone: null,
          status: 'active',
          roles: [],
          createdAt: new Date().toISOString(),
        },
        'تم إنشاء الحساب.',
      )
    }),
  ),

  route('PUT', '/school/users/:id', (request) =>
    ok({ id: request.params.id, ...asRecord(request.body), roles: [] }, 'تم حفظ التعديلات.'),
  ),

  route('POST', '/school/users/:id/roles', (request) =>
    ok(
      { id: request.params.id, roles: (asRecord(request.body).roles as string[]) ?? [] },
      'تم تحديث الأدوار.',
    ),
  ),

  route('DELETE', '/school/users/:id', () => noContent()),
]

/** Exported for the admin portal, which reads schools it is not signed into. */
export { toApiResult, toApiStudent }
export type { ResultRow }
