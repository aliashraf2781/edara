import { GRADES, TERMS, gradeById, termById } from '~/mocks/curriculum'
import type { SelectOption } from '~/ui/select'

/**
 * Temporary: while the structure and exam-period screens are hidden, every
 * filter is a term plus a grade, read straight from the fixed curriculum
 * rather than from the reference endpoints.
 */
export const TERM_OPTIONS: readonly SelectOption[] = TERMS.map((term) => ({
  value: term.id,
  label: term.name,
}))

export const GRADE_OPTIONS: readonly SelectOption[] = GRADES.map((grade) => ({
  value: grade.id,
  label: grade.name,
}))

export const DEFAULT_TERM_ID = TERMS[0].id
export const DEFAULT_GRADE_ID = GRADES[0].id

export const termName = (id: string) => termById(id)?.name ?? id
export const gradeName = (id: string) => gradeById(id)?.name ?? id
