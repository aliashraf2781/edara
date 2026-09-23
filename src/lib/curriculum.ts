/**
 * The Grades 4–6 curriculum. The subject list is the one printed on
 * `src/templates/grades(4-5-6).html` — the XLSX template, the import parser,
 * the report figures and the printed extract all read this file, so the
 * four stay in step by construction.
 */

export type GradeLevel = 4 | 5 | 6

export type MockGrade = {
  id: string
  code: string
  name: string
  level: GradeLevel
  /** The ordinal used inside subject names: مستوى رابع / خامس / سادس. */
  ordinal: string
}

export const EDUCATIONAL_STAGE = {
  id: 'stage-primary',
  code: 'PRIM',
  name: 'المرحلة الابتدائية',
  sort_order: 1,
}

export const GRADES: readonly MockGrade[] = [
  { id: 'grade-4', code: 'G4', name: 'الصف الرابع الابتدائي', level: 4, ordinal: 'رابع' },
  { id: 'grade-5', code: 'G5', name: 'الصف الخامس الابتدائي', level: 5, ordinal: 'خامس' },
  { id: 'grade-6', code: 'G6', name: 'الصف السادس الابتدائي', level: 6, ordinal: 'سادس' },
]

export const gradeById = (id: string) => GRADES.find((grade) => grade.id === id) ?? null
export const gradeByLevel = (level: number) => GRADES.find((grade) => grade.level === level) ?? null

/** The two terms an operator picks between before uploading a sheet. */
export type MockTerm = { id: string; code: string; name: string; term: 1 | 2 }

export const TERMS: readonly MockTerm[] = [
  { id: 'term-1', code: 'T1', name: 'الترم الأول', term: 1 },
  { id: 'term-2', code: 'T2', name: 'الترم الثاني', term: 2 },
]

export const termById = (id: string) => TERMS.find((term) => term.id === id) ?? null

/**
 * Column groups as they are printed across the top of the official extract.
 * `blank` is the fourth group, which the form leaves unlabelled.
 */
export type SubjectGroup = 'pass_fail' | 'formative' | 'attendance' | 'blank'

export type MockSubject = {
  /** Stable across grades: `arabic`, and per grade `grade-4.arabic`. */
  key: string
  name: (ordinal: string) => string
  grading_type: 'numeric' | 'qualitative'
  max_score: number | null
  pass_score: number | null
  group: SubjectGroup
}

/** Nine graded subjects, then four pass/fail ones — the printed order. */
export const SUBJECT_BLUEPRINT: readonly MockSubject[] = [
  { key: 'arabic', name: () => 'اللغة العربية', grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'pass_fail' },
  { key: 'math', name: () => 'الرياضيات', grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'pass_fail' },
  { key: 'social', name: () => 'الدراسات الاجتماعية', grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'pass_fail' },
  { key: 'science', name: () => 'العلوم', grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'formative' },
  { key: 'english', name: () => 'اللغة الانجليزية', grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'attendance' },
  { key: 'ict', name: () => 'تكنولوجيا المعلومات والاتصالات', grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'attendance' },
  // The one graded subject whose pass mark is 70, not 50.
  { key: 'international', name: () => 'التربية الدولية', grading_type: 'numeric', max_score: 100, pass_score: 70, group: 'attendance' },
  { key: 'level-1', name: (ordinal) => `مستوى ${ordinal} (١)`, grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'attendance' },
  { key: 'level-2', name: (ordinal) => `مستوى ${ordinal} (٢)`, grading_type: 'numeric', max_score: 100, pass_score: 50, group: 'attendance' },
  { key: 'tokatsu', name: () => 'توكاتسو', grading_type: 'qualitative', max_score: null, pass_score: null, group: 'blank' },
  { key: 'pe', name: () => 'التربية البدنية والصحية', grading_type: 'qualitative', max_score: null, pass_score: null, group: 'blank' },
  { key: 'art', name: () => 'التربية الفنية', grading_type: 'qualitative', max_score: null, pass_score: null, group: 'blank' },
  { key: 'music', name: () => 'التربية العقلية و الموسيقية', grading_type: 'qualitative', max_score: null, pass_score: null, group: 'blank' },
]

export type CurriculumSubject = {
  id: string
  grade_id: string
  educational_stage_id: string
  code: string
  name: string
  grading_type: 'numeric' | 'qualitative'
  max_score: number | null
  pass_score: number | null
  group: SubjectGroup
}

const subjectCache = new Map<string, CurriculumSubject[]>()

/** The 13 subjects of one grade, in printed order. */
export function subjectsForGrade(gradeId: string): CurriculumSubject[] {
  const cached = subjectCache.get(gradeId)
  if (cached) return cached

  const grade = gradeById(gradeId)
  if (!grade) return []

  const rows = SUBJECT_BLUEPRINT.map((blueprint) => ({
    id: `${gradeId}.${blueprint.key}`,
    grade_id: gradeId,
    educational_stage_id: EDUCATIONAL_STAGE.id,
    code: `${grade.code}-${blueprint.key.toUpperCase()}`,
    name: blueprint.name(grade.ordinal),
    grading_type: blueprint.grading_type,
    max_score: blueprint.max_score,
    pass_score: blueprint.pass_score,
    group: blueprint.group,
  }))

  subjectCache.set(gradeId, rows)
  return rows
}

export const allSubjects = (): CurriculumSubject[] => GRADES.flatMap((grade) => subjectsForGrade(grade.id))

export const subjectById = (id: string): CurriculumSubject | null =>
  allSubjects().find((subject) => subject.id === id) ?? null

/** Header labels the uploaded sheet must carry, left to right. */
export const sheetHeaders = (gradeId: string): string[] => [
  'م',
  'كود الطالب',
  'اسم الطالب',
  'الفصل',
  ...subjectsForGrade(gradeId).map((subject) => subject.name),
]

/** What a qualitative cell may say in the sheet, and what it means. */
export const PASSED_LABEL = 'اجتياز'
export const FAILED_LABEL = 'لم يجتز'

export const QUALITATIVE_LABELS: Record<string, string> = {
  exceeds_expectations: 'يفوق التوقعات',
  meets_expectations: 'يحقق التوقعات',
  sometimes_meets_expectations: 'يحقق التوقعات أحيانًا',
  below_expectations: 'أقل من التوقعات',
}

export const isQualitativePass = (rating: string | null) =>
  rating !== null && rating !== 'below_expectations'

/** Sheet cell text → stored rating. Accepts the four labels and اجتياز/لم يجتز. */
export function ratingFromCell(cell: string): string | null {
  const text = cell.trim()
  if (text === '') return null
  if (text === PASSED_LABEL || text === 'ناجح' || text === 'مجتاز') return 'meets_expectations'
  if (text === FAILED_LABEL || text === 'راسب' || text === 'غير مجتاز') return 'below_expectations'
  const match = Object.entries(QUALITATIVE_LABELS).find(([, label]) => label === text)
  return match ? match[0] : null
}

export const ratingToCell = (rating: string | null) =>
  rating === null ? '' : isQualitativePass(rating) ? PASSED_LABEL : FAILED_LABEL
