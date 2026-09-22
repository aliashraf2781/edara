/**
 * The temporary in-browser backend.
 *
 * Reference data (years, classrooms, students, seeded marks) is *derived* from
 * a school's code rather than stored, so a freshly created school already has
 * a believable roster and the payload kept in localStorage stays small. Only
 * what an operator actually changed — schools, hand-added students, uploaded
 * marks, import runs — is persisted on top.
 */

import {
  GRADES,
  EDUCATIONAL_STAGE,
  TERMS,
  gradeById,
  subjectsForGrade,
  isQualitativePass,
  type CurriculumSubject,
} from './curriculum'
import {
  DIRECTORATES,
  FAMILY_NAMES,
  FATHER_NAMES,
  FEMALE_NAMES,
  GOVERNORATES,
  MALE_NAMES,
  SCHOOL_NAMES,
} from './names'
import { intBetween, rng } from './random'

const STORAGE_KEY = 'edara.mock.v1'

/* ------------------------------------------------------------------ types */

export type MockSchool = {
  id: string
  code: string
  name: string
  status: 'pending' | 'active' | 'disabled' | 'archived'
  provisioningStatus: 'pending' | 'provisioning' | 'provisioned' | 'failed'
  governorate: string | null
  directorate: string
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  createdAt: string
  updatedAt: string
  admins: {
    id: string
    name: string
    email: string
    relationship: 'owner' | 'officer' | 'reviewer'
    isPrimary: boolean
  }[]
  /** The composite login the school portal accepts, plus its password. */
  login: { email: string; password: string }
}

export type MockStudent = {
  id: string
  schoolCode: string
  student_code: string
  seat_no: string
  national_id: string
  first_name: string
  father_name: string
  family_name: string
  gender: 'male' | 'female'
  birth_date: string
  guardian_name: string
  guardian_phone: string
  status: 'active'
  grade_id: string
  classroom_id: string
}

export type ResultStatusValue =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'published'

export type StoredResult = {
  score: number | null
  qualitative_rating: string | null
  is_absent: boolean
  status: ResultStatusValue
  updatedAt: string
}

export type MockImportRun = {
  id: string
  schoolCode: string
  gradeId: string
  termId: string
  fileName: string
  status: 'completed' | 'failed'
  total_rows: number
  valid_rows: number
  invalid_rows: number
  imported_rows: number
  errors: {
    row_number: number
    error_code: string
    error_message: string
    row_payload: Record<string, unknown>
  }[]
  createdAt: string
}

type MockState = {
  version: number
  schools: MockSchool[]
  extraStudents: Record<string, MockStudent[]>
  /** `${studentId}__${subjectId}__${termId}` -> the mark an operator uploaded. */
  results: Record<string, StoredResult>
  imports: MockImportRun[]
}

/* ------------------------------------------------------------- persistence */

const now = () => new Date().toISOString()

const SEED_CODES = ['SCH-NILE01', 'SCH-AMAL02', 'SCH-TAHA03']

function seedSchool(code: string, index: number): MockSchool {
  const random = rng(`school:${code}`)
  const created = new Date(2025, 7, 15 + index).toISOString()
  return {
    id: `tenant-${index + 1}`,
    code,
    name: SCHOOL_NAMES[index % SCHOOL_NAMES.length],
    status: 'active',
    provisioningStatus: 'provisioned',
    governorate: GOVERNORATES[Math.floor(random() * GOVERNORATES.length)],
    directorate: DIRECTORATES[index % DIRECTORATES.length],
    contactEmail: `info_${code.toLowerCase()}@pp.com`,
    contactPhone: `010${intBetween(random, 10000000, 99999999)}`,
    address: 'ش المدارس، أمام المجلس المحلي',
    createdAt: created,
    updatedAt: created,
    admins: [
      {
        id: `tenant-admin-${index + 1}`,
        name: 'مدير المدرسة',
        email: `admin_${code}@pp.com`,
        relationship: 'owner',
        isPrimary: true,
      },
    ],
    login: { email: `admin_${code}@pp.com`, password: 'Password123!' },
  }
}

const freshState = (): MockState => ({
  version: 1,
  schools: SEED_CODES.map(seedSchool),
  extraStudents: {},
  results: {},
  imports: [],
})

let state: MockState | null = null

function load(): MockState {
  if (state) return state
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as MockState) : null
    state = parsed && parsed.version === 1 ? parsed : freshState()
  } catch {
    state = freshState()
  }
  return state
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(load()))
  } catch {
    // A full or blocked storage quota must not break the screen: the session
    // simply stops surviving a reload.
  }
}

export function resetMockData() {
  state = freshState()
  save()
}

/* ------------------------------------------------------------- reference */

export const ACADEMIC_YEARS = [
  {
    id: 'year-2025',
    code: '2025/2026',
    name: 'العام الدراسي ٢٠٢٥/٢٠٢٦',
    starts_on: '2025-09-20',
    ends_on: '2026-06-10',
    is_current: true,
  },
  {
    id: 'year-2024',
    code: '2024/2025',
    name: 'العام الدراسي ٢٠٢٤/٢٠٢٥',
    starts_on: '2024-09-21',
    ends_on: '2025-06-12',
    is_current: false,
  },
]

export const CURRENT_YEAR_ID = ACADEMIC_YEARS[0].id

const ARABIC_INDEX = ['١', '٢', '٣']

export type MockClassroom = {
  id: string
  grade_id: string
  academic_year_id: string
  code: string
  name: string
  capacity: number
}

/** Two classrooms per grade, in the current year. */
export const CLASSROOMS: MockClassroom[] = GRADES.flatMap((grade) =>
  [0, 1].map((slot) => ({
    id: `${grade.id}.c${slot + 1}`,
    grade_id: grade.id,
    academic_year_id: CURRENT_YEAR_ID,
    code: `${grade.code}/${slot + 1}`,
    name: `${grade.name} — فصل ${ARABIC_INDEX[slot]}`,
    capacity: 40,
  })),
)

export const classroomById = (id: string) => CLASSROOMS.find((room) => room.id === id) ?? null

export const classroomsOfGrade = (gradeId: string) =>
  CLASSROOMS.filter((room) => room.grade_id === gradeId)

/**
 * Exam periods are the two terms of each year — kept so anything still
 * referring to a period id keeps resolving while those screens are hidden.
 */
export const EXAM_PERIODS = ACADEMIC_YEARS.flatMap((year) =>
  TERMS.map((term) => ({
    id: `${year.id}.${term.id}`,
    academic_year_id: year.id,
    code: `${year.code}-${term.code}`,
    name: `${term.name} — ${year.code}`,
    type: 'term',
    term: term.term,
    starts_on: null,
    ends_on: null,
    status: 'open',
    entry_opens_at: null,
    entry_closes_at: null,
    locked_at: null,
    created_at: year.starts_on,
    updated_at: year.starts_on,
  })),
)

export const termIdOfPeriod = (periodId: string) =>
  periodId.split('.').slice(1).join('.') || periodId

/* --------------------------------------------------------------- schools */

export const listSchools = (): MockSchool[] => load().schools

export const schoolByCode = (code: string): MockSchool | null =>
  load().schools.find((school) => school.code === code) ?? null

export const schoolByLogin = (email: string): MockSchool | null => {
  const wanted = email.trim().toLowerCase()
  return (
    load().schools.find(
      (school) =>
        school.login.email.toLowerCase() === wanted ||
        (school.contactEmail ?? '').toLowerCase() === wanted,
    ) ?? null
  )
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function nextSchoolCode(): string {
  const random = rng(`code:${Date.now()}:${load().schools.length}`)
  let suffix = ''
  for (let index = 0; index < 6; index += 1) {
    suffix += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]
  }
  return `SCH-${suffix}`
}

export function createSchool(draft: {
  name: string
  admin_email: string
  admin_password: string
}): MockSchool {
  const data = load()
  const code = nextSchoolCode()
  const stamp = now()
  const school: MockSchool = {
    id: `tenant-${data.schools.length + 1}`,
    code,
    name: draft.name,
    status: 'active',
    provisioningStatus: 'provisioned',
    governorate: null,
    directorate: DIRECTORATES[data.schools.length % DIRECTORATES.length],
    contactEmail: draft.admin_email,
    contactPhone: null,
    address: null,
    createdAt: stamp,
    updatedAt: stamp,
    admins: [
      {
        id: `tenant-admin-${data.schools.length + 1}`,
        name: draft.admin_email.split('@')[0],
        email: `admin_${code}@pp.com`,
        relationship: 'owner',
        isPrimary: true,
      },
    ],
    // The portal accepts either the composite login or the address that was
    // typed on the create form — an operator remembers the latter.
    login: { email: `admin_${code}@pp.com`, password: draft.admin_password },
  }
  data.schools.push(school)
  save()
  return school
}

export function updateSchool(code: string, patch: Partial<MockSchool>): MockSchool | null {
  const school = schoolByCode(code)
  if (!school) return null
  Object.assign(school, patch, { updatedAt: now() })
  save()
  return school
}

export function deleteSchool(code: string): boolean {
  const data = load()
  const index = data.schools.findIndex((school) => school.code === code)
  if (index === -1) return false
  data.schools.splice(index, 1)
  save()
  return true
}

/* -------------------------------------------------------------- students */

const STUDENTS_PER_CLASSROOM = 12

function seedStudents(schoolCode: string): MockStudent[] {
  const rows: MockStudent[] = []
  let serial = 0

  for (const grade of GRADES) {
    for (const classroom of classroomsOfGrade(grade.id)) {
      for (let index = 0; index < STUDENTS_PER_CLASSROOM; index += 1) {
        serial += 1
        const random = rng(`${schoolCode}:${classroom.id}:${index}`)
        const gender: 'male' | 'female' = random() < 0.5 ? 'male' : 'female'
        const pool = gender === 'male' ? MALE_NAMES : FEMALE_NAMES
        const first = pool[Math.floor(random() * pool.length)]
        const father = FATHER_NAMES[Math.floor(random() * FATHER_NAMES.length)]
        const family = FAMILY_NAMES[Math.floor(random() * FAMILY_NAMES.length)]
        const serialText = String(serial).padStart(3, '0')
        const birthYear = 2026 - grade.level - 6

        rows.push({
          id: `${schoolCode}.st${serialText}`,
          schoolCode,
          student_code: `${schoolCode.replace('SCH-', '')}${serialText}`,
          seat_no: `${grade.level}${String(10000 + serial)}`,
          national_id: `3${String(birthYear).slice(2)}${String(intBetween(random, 100000000, 999999999))}`,
          first_name: first,
          father_name: father,
          family_name: family,
          gender,
          birth_date: `${birthYear}-${String(intBetween(random, 1, 12)).padStart(2, '0')}-${String(intBetween(random, 1, 28)).padStart(2, '0')}`,
          guardian_name: `${father} ${family}`,
          guardian_phone: `011${intBetween(random, 10000000, 99999999)}`,
          status: 'active',
          grade_id: grade.id,
          classroom_id: classroom.id,
        })
      }
    }
  }

  return rows
}

const studentCache = new Map<string, MockStudent[]>()

export function studentsOf(schoolCode: string): MockStudent[] {
  let seeded = studentCache.get(schoolCode)
  if (!seeded) {
    seeded = seedStudents(schoolCode)
    studentCache.set(schoolCode, seeded)
  }
  return [...seeded, ...(load().extraStudents[schoolCode] ?? [])]
}

export const studentById = (schoolCode: string, id: string): MockStudent | null =>
  studentsOf(schoolCode).find((student) => student.id === id) ?? null

export const studentByCode = (schoolCode: string, code: string): MockStudent | null =>
  studentsOf(schoolCode).find((student) => student.student_code === String(code).trim()) ?? null

export const fullName = (student: MockStudent) =>
  [student.first_name, student.father_name, student.family_name].filter(Boolean).join(' ')

export function addStudent(
  schoolCode: string,
  student: Omit<MockStudent, 'id' | 'schoolCode'>,
): MockStudent {
  const data = load()
  const bucket = (data.extraStudents[schoolCode] ??= [])
  const row: MockStudent = { ...student, schoolCode, id: `${schoolCode}.ex${bucket.length + 1}` }
  bucket.push(row)
  save()
  return row
}

export function replaceStudent(
  schoolCode: string,
  id: string,
  patch: Partial<MockStudent>,
): MockStudent | null {
  const bucket = load().extraStudents[schoolCode] ?? []
  const row = bucket.find((student) => student.id === id)
  if (row) {
    Object.assign(row, patch)
    save()
    return row
  }
  // Seeded students are read-only; report the current row rather than failing.
  return studentById(schoolCode, id)
}

/* --------------------------------------------------------------- results */

export const resultKey = (studentId: string, subjectId: string, termId: string) =>
  `${studentId}__${subjectId}__${termId}`

export const parseResultKey = (key: string) => {
  const [studentId, subjectId, termId] = key.split('__')
  return studentId && subjectId && termId ? { studentId, subjectId, termId } : null
}

/**
 * A seeded mark. About 97% of individual marks pass — which, over thirteen
 * subjects, leaves roughly two thirds of students passing everything. Both
 * verdicts therefore appear on the printed extract without either looking
 * like an error.
 */
function seedResult(
  student: MockStudent,
  subject: CurriculumSubject,
  termId: string,
): StoredResult {
  const random = rng(`${student.id}:${subject.id}:${termId}`)
  const absent = random() < 0.005

  if (subject.grading_type === 'qualitative') {
    const roll = random()
    const rating =
      roll < 0.35
        ? 'exceeds_expectations'
        : roll < 0.85
          ? 'meets_expectations'
          : roll < 0.975
            ? 'sometimes_meets_expectations'
            : 'below_expectations'
    return {
      score: null,
      qualitative_rating: absent ? 'below_expectations' : rating,
      is_absent: absent,
      status: 'published',
      updatedAt: `${student.birth_date}T08:00:00.000Z`,
    }
  }

  const pass = subject.pass_score ?? 50
  const max = subject.max_score ?? 100
  const score = absent
    ? 0
    : random() < 0.975
      ? intBetween(random, pass, max)
      : intBetween(random, Math.round(pass * 0.45), pass - 1)

  return {
    score,
    qualitative_rating: null,
    is_absent: absent,
    status: 'published',
    updatedAt: `${student.birth_date}T08:00:00.000Z`,
  }
}

export function readResult(
  student: MockStudent,
  subject: CurriculumSubject,
  termId: string,
): StoredResult {
  return load().results[resultKey(student.id, subject.id, termId)] ?? seedResult(student, subject, termId)
}

export function writeResult(
  studentId: string,
  subjectId: string,
  termId: string,
  value: Omit<StoredResult, 'updatedAt'>,
) {
  load().results[resultKey(studentId, subjectId, termId)] = { ...value, updatedAt: now() }
  save()
}

export function writeResults(
  rows: {
    studentId: string
    subjectId: string
    termId: string
    value: Omit<StoredResult, 'updatedAt'>
  }[],
) {
  const data = load()
  const stamp = now()
  for (const row of rows) {
    data.results[resultKey(row.studentId, row.subjectId, row.termId)] = {
      ...row.value,
      updatedAt: stamp,
    }
  }
  save()
}

export const isPass = (subject: CurriculumSubject, result: StoredResult): boolean => {
  if (result.is_absent) return false
  if (subject.grading_type === 'qualitative') return isQualitativePass(result.qualitative_rating)
  return (result.score ?? 0) >= (subject.pass_score ?? 50)
}

export type ResultRow = {
  id: string
  student: MockStudent
  subject: CurriculumSubject
  termId: string
  value: StoredResult
}

/**
 * Every mark of one school, optionally narrowed — the one read path that the
 * reports, the results table and the printed extract all share.
 */
export function resultRows(
  schoolCode: string,
  filters: {
    termId?: string
    gradeId?: string
    classroomId?: string
    subjectId?: string
    studentId?: string
    status?: string
  } = {},
): ResultRow[] {
  const rows: ResultRow[] = []
  const terms = filters.termId ? TERMS.filter((term) => term.id === filters.termId) : TERMS

  for (const student of studentsOf(schoolCode)) {
    if (filters.gradeId && student.grade_id !== filters.gradeId) continue
    if (filters.classroomId && student.classroom_id !== filters.classroomId) continue
    if (filters.studentId && student.id !== filters.studentId) continue

    for (const subject of subjectsForGrade(student.grade_id)) {
      if (filters.subjectId && subject.id !== filters.subjectId) continue
      for (const term of terms) {
        const value = readResult(student, subject, term.id)
        if (filters.status && value.status !== filters.status) continue
        rows.push({
          id: resultKey(student.id, subject.id, term.id),
          student,
          subject,
          termId: term.id,
          value,
        })
      }
    }
  }

  return rows
}

export function resultById(schoolCode: string, id: string): ResultRow | null {
  const parsed = parseResultKey(id)
  if (!parsed) return null
  const student = studentById(schoolCode, parsed.studentId)
  if (!student) return null
  const subject = subjectsForGrade(student.grade_id).find((row) => row.id === parsed.subjectId)
  if (!subject) return null
  return {
    id,
    student,
    subject,
    termId: parsed.termId,
    value: readResult(student, subject, parsed.termId),
  }
}

/* --------------------------------------------------------------- imports */

export const listImports = (schoolCode?: string) =>
  load().imports.filter((run) => !schoolCode || run.schoolCode === schoolCode)

export function recordImport(run: Omit<MockImportRun, 'id' | 'createdAt'>): MockImportRun {
  const data = load()
  const row: MockImportRun = {
    ...run,
    id: `imp-${data.imports.length + 1}-${Date.now()}`,
    createdAt: now(),
  }
  data.imports.unshift(row)
  save()
  return row
}

/* ----------------------------------------------------------------- stats */

export type SubjectStat = {
  subject_id: string
  subject_name: string
  grading_type: 'numeric' | 'qualitative'
  total: number
  passed: number
  average: number
}

export type SchoolStats = {
  code: string
  name: string
  students: number
  results: number
  passed: number
  passRate: number
  average: number
  byGrade: {
    grade_id: string
    grade_name: string
    students: number
    total: number
    passed: number
    average: number
  }[]
  bySubject: SubjectStat[]
}

const mean = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

export function schoolStats(schoolCode: string, termId?: string): SchoolStats {
  const school = schoolByCode(schoolCode)
  const students = studentsOf(schoolCode)
  const rows = resultRows(schoolCode, { termId })
  const numeric = rows.filter((row) => row.subject.grading_type === 'numeric')
  const passedRows = rows.filter((row) => isPass(row.subject, row.value))

  const byGrade = GRADES.map((grade) => {
    const gradeRows = rows.filter((row) => row.student.grade_id === grade.id)
    const gradeNumeric = gradeRows.filter((row) => row.subject.grading_type === 'numeric')
    return {
      grade_id: grade.id,
      grade_name: grade.name,
      students: students.filter((student) => student.grade_id === grade.id).length,
      total: gradeRows.length,
      passed: gradeRows.filter((row) => isPass(row.subject, row.value)).length,
      average: mean(gradeNumeric.map((row) => row.value.score ?? 0)),
    }
  })

  // Grouped by printed name, not by id: اللغة العربية is one row across all
  // three grades, while مستوى رابع (١) and مستوى خامس (١) stay separate —
  // they are genuinely different subjects.
  const seen = new Map<string, SubjectStat>()
  for (const row of rows) {
    const key = row.subject.name
    const stat = seen.get(key) ?? {
      subject_id: row.subject.id,
      subject_name: row.subject.name,
      grading_type: row.subject.grading_type,
      total: 0,
      passed: 0,
      average: 0,
    }
    stat.total += 1
    if (isPass(row.subject, row.value)) stat.passed += 1
    if (row.subject.grading_type === 'numeric') {
      stat.average = (stat.average * (stat.total - 1) + (row.value.score ?? 0)) / stat.total
    }
    seen.set(key, stat)
  }

  return {
    code: schoolCode,
    name: school?.name ?? schoolCode,
    students: students.length,
    results: rows.length,
    passed: passedRows.length,
    passRate: rows.length === 0 ? 0 : passedRows.length / rows.length,
    average: mean(numeric.map((row) => row.value.score ?? 0)),
    byGrade,
    bySubject: [...seen.values()],
  }
}

export type StudentTermStats = {
  term_id: string
  term_name: string
  total: number
  out_of: number
  passed: number
  average: number
  percent: number
  verdict: 'passed' | 'failed'
  subjects: {
    subject_id: string
    subject_name: string
    grading_type: 'numeric' | 'qualitative'
    score: number | null
    max_score: number | null
    pass_score: number | null
    qualitative_rating: string | null
    is_absent: boolean
    passed: boolean
  }[]
}

export type StudentStats = {
  student: MockStudent
  grade_name: string
  classroom_name: string
  terms: StudentTermStats[]
}

export function studentStats(schoolCode: string, studentId: string): StudentStats | null {
  const student = studentById(schoolCode, studentId)
  if (!student) return null
  const grade = gradeById(student.grade_id)

  return {
    student,
    grade_name: grade?.name ?? student.grade_id,
    classroom_name: classroomById(student.classroom_id)?.name ?? '—',
    terms: TERMS.map((term) => {
      const subjects = subjectsForGrade(student.grade_id).map((subject) => {
        const value = readResult(student, subject, term.id)
        return {
          subject_id: subject.id,
          subject_name: subject.name,
          grading_type: subject.grading_type,
          score: value.score,
          max_score: subject.max_score,
          pass_score: subject.pass_score,
          qualitative_rating: value.qualitative_rating,
          is_absent: value.is_absent,
          passed: isPass(subject, value),
        }
      })
      const numeric = subjects.filter((subject) => subject.grading_type === 'numeric')
      const total = numeric.reduce((sum, subject) => sum + (subject.score ?? 0), 0)
      const outOf = numeric.reduce((sum, subject) => sum + (subject.max_score ?? 0), 0)
      return {
        term_id: term.id,
        term_name: term.name,
        total,
        out_of: outOf,
        passed: subjects.filter((subject) => subject.passed).length,
        average: numeric.length === 0 ? 0 : total / numeric.length,
        percent: outOf === 0 ? 0 : (total / outOf) * 100,
        verdict: subjects.every((subject) => subject.passed) ? ('passed' as const) : ('failed' as const),
        subjects,
      }
    }),
  }
}

export const STAGE = EDUCATIONAL_STAGE
