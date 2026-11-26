import { useMemo } from 'react'
import type { SelectOption } from '~/ui/select'
import { useAcademicList } from './academics'
import { useAllExamPeriods, useExamPeriods } from './exam-periods'
import type { AcademicYear, Classroom, EducationalStage, ExamPeriod, Grade, Subject } from './types'

type Named = { id: string; name: string; code?: string }

const toOptions = (rows: readonly Named[] | undefined): SelectOption[] =>
  (rows ?? []).map((row) => ({
    value: row.id,
    label: row.code ? `${row.code} — ${row.name}` : row.name,
  }))

/**
 * Pickers across Students, Results and Imports read the same cached reference
 * lists, so opening a form does not refetch what another screen already has.
 */
export function useYearOptions(): SelectOption[] {
  const list = useAcademicList<AcademicYear>('academic-years', {})
  return useMemo(
    () => (list.data ?? []).map((year) => ({ value: year.id, label: yearLabel(year) })),
    [list.data],
  )
}

/**
 * An academic year always reads "2025/2026" — shown once (its code and name are
 * the same text), left-to-right even inside Arabic text, so the slash never
 * flips it into "2026/2025".
 */
export const yearLabel = (year: Pick<AcademicYear, 'code' | 'name'>): string => {
  const text = year.name && year.name !== year.code ? `${year.code} — ${year.name}` : year.code
  return `\u200E${text}\u200E`
}

export function useStageOptions(): SelectOption[] {
  const list = useAcademicList<EducationalStage>('educational-stages', {})
  return useMemo(() => toOptions(list.data), [list.data])
}

export function useGradeOptions(stageId?: string): SelectOption[] {
  const list = useAcademicList<Grade>(
    'grades',
    stageId ? { educational_stage_id: stageId } : {},
  )
  return useMemo(() => toOptions(list.data), [list.data])
}

export function useClassroomOptions(filters: {
  gradeId?: string
  academicYearId?: string
}): SelectOption[] {
  const list = useAcademicList<Classroom>('classrooms', {
    grade_id: filters.gradeId,
    academic_year_id: filters.academicYearId,
  })
  return useMemo(() => toOptions(list.data), [list.data])
}

export function useSubjectOptions(gradeId?: string): SelectOption[] {
  const list = useAcademicList<Subject>('subjects', gradeId ? { grade_id: gradeId } : {})
  return useMemo(() => toOptions(list.data), [list.data])
}

/** Raw subject records, e.g. so a picker can branch on `grading_type`. */
export function useSubjects(gradeId?: string) {
  return useAcademicList<Subject>('subjects', gradeId ? { grade_id: gradeId } : {})
}

export function useExamPeriodOptions(academicYearId: string): SelectOption[] {
  const list = useExamPeriods(academicYearId, academicYearId !== '')
  return useMemo(() => toOptions(list.data as ExamPeriod[] | undefined), [list.data])
}

/**
 * Every school has the same two terms in each of its academic years, so a bare
 * term name is ambiguous ("الترم الأول" once per year): a term always reads
 * "2025/2026 — الترم الأول".
 */
const termLabel = (name: string, year: Pick<AcademicYear, 'code' | 'name'> | undefined): string =>
  year ? `${yearLabel(year)} — ${name}` : name

/** Not scoped to one academic year — backs pickers that filter by term alone. */
export function useAllExamPeriodOptions(): SelectOption[] {
  const list = useAllExamPeriods()
  const years = useAcademicList<AcademicYear>('academic-years', {})
  return useMemo(() => {
    const yearById = new Map((years.data ?? []).map((year) => [year.id, year]))
    return (list.data ?? [])
      .map((term) => ({ term, year: yearById.get(term.academic_year_id) }))
      .sort(
        (a, b) =>
          (a.year?.code ?? '').localeCompare(b.year?.code ?? '') ||
          (a.term.term ?? 0) - (b.term.term ?? 0),
      )
      .map(({ term, year }) => ({ value: term.id, label: termLabel(term.name, year) }))
  }, [list.data, years.data])
}

/** Live id -> name lookups for table cells, replacing the old fixed mock curriculum. */
export function useCurriculumNames() {
  const grades = useAcademicList<Grade>('grades', {})
  const terms = useAllExamPeriods()
  const years = useAcademicList<AcademicYear>('academic-years', {})

  const gradeById = new Map((grades.data ?? []).map((grade) => [grade.id, grade.name]))
  const yearById = new Map((years.data ?? []).map((year) => [year.id, year]))
  const termById = new Map(
    (terms.data ?? []).map((term) => [term.id, termLabel(term.name, yearById.get(term.academic_year_id))]),
  )

  return {
    gradeName: (id: string) => gradeById.get(id) ?? id,
    termName: (id: string) => termById.get(id) ?? id,
  }
}
