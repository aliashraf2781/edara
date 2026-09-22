export type UserStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'banned'

export type GlobalUser = {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  status: UserStatus
  emailVerified: boolean
  lastLoginAt: string | null
  locale: string
  timezone: string
  preferences: Record<string, unknown>
  roles: string[]
  createdAt: string
  updatedAt: string
}

export type TenantStatus = 'pending' | 'active' | 'disabled' | 'archived'
export type ProvisioningStatus = 'pending' | 'provisioning' | 'provisioned' | 'failed'
export type AdminRelationship = 'owner' | 'officer' | 'reviewer'

export type TenantAdmin = {
  id: string
  name: string
  email: string
  relationship: AdminRelationship
  isPrimary: boolean
}

/** The lighter shape returned by the list endpoint — no admins or contact fields. */
export type TenantSummary = {
  id: string
  code: string
  name: string
  status: TenantStatus
  provisioningStatus: ProvisioningStatus
  governorate: string | null
  createdAt: string
}

export type Tenant = TenantSummary & {
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  settings: Record<string, unknown> | null
  admins: TenantAdmin[]
  updatedAt: string
}

/**
 * `temporaryPassword` is null on a repeat call — that is success, not failure.
 * Check `tenant.provisioningStatus` to decide what happened.
 */
export type ProvisionResult = {
  tenant: Tenant
  superAdmin: { email: string; temporaryPassword: string | null }
}

/**
 * The operator sets the Super Admin's password directly on create, so
 * there is no `temporaryPassword` here — only `ProvisionResult` (the
 * manual-retry path) reveals one. `superAdmin.email` is the actual composite
 * login email (e.g. `admin_SCH-KJFZBV@pp.com`); it differs from whatever
 * plain `admin_email` was submitted and is never surfaced again after this.
 */
export type TenantCreateResult = {
  tenant: Tenant
  superAdmin: { email: string }
}

export type Role = {
  id: number
  name: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export type AuditLogEntry = {
  id: string
  logName: string
  description: string
  subjectType: string | null
  causerId: string | null
  createdAt: string
}

export type AdminIdentity = {
  user: GlobalUser
  permissions: string[]
}

export type AuthTokens = {
  user: GlobalUser
  accessToken: string
  tokenType: string
  accessExpiresIn: number
  refreshToken: string
  refreshExpiresIn: number
}

/* ------------------------------------------------- management: curriculum */

export type GradingType = 'numeric' | 'qualitative'

/** The four column groups printed across the official extract, in order. */
export type SubjectGroup = 'pass_fail' | 'formative' | 'attendance' | 'blank'

export type ReferenceGrade = { id: string; code: string; name: string; level: number }
export type ReferenceTerm = { id: string; code: string; name: string; term: number }

export type ReferenceClassroom = {
  id: string
  grade_id: string
  academic_year_id: string
  code: string
  name: string
  capacity: number
}

export type ReferenceSubject = {
  id: string
  grade_id: string
  educational_stage_id: string | null
  code: string
  name: string
  grading_type: GradingType
  max_score: number | null
  pass_score: number | null
  /** Print-layout grouping — not tracked for a real (non-mock) school's subjects. */
  group?: SubjectGroup
}

/** Grades, terms, classrooms and subjects — everything the filters need. */
export type AdminReference = {
  grades: ReferenceGrade[]
  terms: ReferenceTerm[]
  classrooms: ReferenceClassroom[]
  subjects: ReferenceSubject[]
}

/* ----------------------------------------------------- management: figures */

export type GradeStat = {
  grade_id: string
  grade_name: string
  students: number
  total: number
  passed: number
  average: number
}

export type SubjectStat = {
  subject_id: string
  subject_name: string
  grading_type: GradingType
  total: number
  passed: number
  average: number
}

/** `passRate` and `average` are fractions/means, not formatted percentages. */
export type SchoolStats = {
  code: string
  name: string
  students: number
  results: number
  passed: number
  passRate: number
  average: number
  byGrade: GradeStat[]
  bySubject: SubjectStat[]
}

export type ResultStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'published'

export type SchoolStudentRow = {
  id: string
  student_code: string
  seat_no: string
  name: string
  gender: 'male' | 'female'
  grade_id: string
  grade_name: string
  classroom_id: string
  classroom_name: string
}

export type SchoolResultRow = {
  id: string
  student_id: string
  student_code: string
  student_name: string
  grade_id: string
  grade_name: string
  classroom_name: string
  subject_id: string
  subject_name: string
  grading_type: GradingType
  term_id: string
  term_name: string
  score: number | null
  max_score: number | null
  pass_score: number | null
  qualitative_rating: string | null
  is_absent: boolean
  status: ResultStatus
  passed: boolean
}

export type StudentTermSubject = {
  subject_id: string
  subject_name: string
  grading_type: GradingType
  score: number | null
  max_score: number | null
  pass_score: number | null
  qualitative_rating: string | null
  is_absent: boolean
  passed: boolean
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
  subjects: StudentTermSubject[]
}

export type StudentRecord = {
  id: string
  student_code: string
  seat_no: string
  national_id: string
  first_name: string
  father_name: string
  family_name: string
  gender: 'male' | 'female'
  birth_date: string
  grade_id: string
  classroom_id: string
}

export type StudentDetail = {
  student: StudentRecord
  grade_name: string
  classroom_name: string
  terms: StudentTermStats[]
  school: { code: string; name: string; directorate: string; governorate: string | null }
}
