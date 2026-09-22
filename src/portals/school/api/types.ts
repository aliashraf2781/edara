import type { CurriculumSubject } from '~/mocks/curriculum'

export type SchoolUserStatus = 'active' | 'suspended'

export type SchoolUser = {
  id: string
  name: string
  email: string
  phone: string | null
  status: SchoolUserStatus
  roles: string[]
  createdAt: string
}

export type SchoolIdentity = {
  user: SchoolUser
  school: { code: string; name: string }
  permissions: string[]
}

export type AcademicYear = {
  id: string
  code: string
  name: string
  starts_on: string
  ends_on: string
  is_current: boolean
}

export type EducationalStage = {
  id: string
  code: string
  name: string
  sort_order: number | null
}

export type Grade = {
  id: string
  educational_stage_id: string
  code: string
  name: string
  level: number | null
}

export type Classroom = {
  id: string
  grade_id: string
  academic_year_id: string
  code: string
  name: string
  capacity: number | null
}

export type ExamPeriod = {
  id: string
  academic_year_id: string
  code: string
  name: string
  type: string
  term: number | null
  starts_on: string | null
  ends_on: string | null
  status: string | null
  entry_opens_at: string | null
  entry_closes_at: string | null
  locked_at: string | null
  created_at: string
  updated_at: string
}

export type GradingType = 'numeric' | 'qualitative'

export type Subject = {
  id: string
  grade_id: string | null
  educational_stage_id: string | null
  code: string
  name: string
  grading_type: GradingType
  /** Null for qualitative subjects. */
  max_score: number | null
  /** Null for qualitative subjects. */
  pass_score: number | null
}

export type Gender = 'male' | 'female'

export type Enrollment = {
  id: string
  academic_year_id: string
  grade_id: string
  classroom_id: string
  enrolled_on: string | null
  classroom?: Classroom
  academic_year?: AcademicYear
}

export type Student = {
  id: string
  student_code: string
  national_id: string | null
  first_name: string
  father_name: string | null
  family_name: string | null
  gender: Gender
  birth_date: string | null
  guardian_name: string | null
  guardian_phone: string | null
  status: string | null
  enrollments?: Enrollment[]
}

/** The workflow is a fixed graph; the UI only ever offers a legal next move. */
export const RESULT_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'published',
] as const

export type ResultStatus = (typeof RESULT_STATUSES)[number]

export type ResultTransition = {
  id: string
  from_status: ResultStatus | null
  to_status: ResultStatus
  reason: string | null
  causer_name: string | null
  created_at: string
}

/** Populated instead of score/max_score when the subject is qualitative. */
export const QUALITATIVE_RATINGS = [
  'exceeds_expectations',
  'meets_expectations',
  'sometimes_meets_expectations',
  'below_expectations',
] as const

export type QualitativeRating = (typeof QUALITATIVE_RATINGS)[number]

export type Result = {
  id: string
  student_enrollment_id: string
  student_id: string
  student_code: string
  student_name: string
  grade_id: string
  classroom_id: string
  subject_id: string
  subject_name: string
  grading_type: GradingType
  term_id: string
  exam_period_id: string
  /** Null when the subject is qualitative — see `qualitative_rating`. */
  score: number | null
  max_score: number | null
  pass_score: number | null
  qualitative_rating: QualitativeRating | null
  is_absent: boolean
  status: ResultStatus
  reason: string | null
  /** The server's verdict: the 70-mark subject and the qualitative ones differ. */
  passed: boolean
  transitions?: ResultTransition[]
}

export type ImportErrorCode =
  | 'duplicate_row'
  | 'unknown_student'
  | 'not_enrolled'
  | 'invalid_score'
  | 'invalid_rating'
  | 'processing_error'
  | 'no_classroom_available'

export type ImportRowError = {
  row_number: number
  error_code: ImportErrorCode
  error_message: string
  row_payload: Record<string, unknown>
}

export type ImportReport = {
  id: string
  status: string
  file_name: string
  grade_id: string
  gradeDetectedFromSheet: boolean
  term_id: string
  termDetectedFromSheet: boolean
  created_at: string
  /** Student rows in the sheet. */
  total_rows: number
  /** Students whose every filled subject column imported cleanly. */
  valid_rows: number
  /** Students with at least one unusable cell. */
  invalid_rows: number
  /** Individual subject results written — not student count. */
  imported_rows: number
  /** New Student records created from sheet rows with an unrecognized code. */
  studentsCreated: number
  errors: ImportRowError[]
}

/** Everything the upload screen needs to build one grade's template. */
export type RosterStudent = {
  serial: number
  id: string
  student_code: string
  seat_no: string
  name: string
  classroom: string
}

export type Roster = {
  school: { code: string; name: string; directorate: string; governorate: string }
  grade: { id: string; name: string; level: number }
  subjects: CurriculumSubject[]
  students: RosterStudent[]
}

export type ReportSummary = {
  overall: { total: number; passed: number; average: number }
  byGrade: { grade_id: string; total: number; passed: number; average: number }[]
}
