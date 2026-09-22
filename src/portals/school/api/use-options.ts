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
  return useMemo(() => toOptions(list.data), [list.data])
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

/** Not scoped to one academic year — backs pickers that filter by term alone. */
export function useAllExamPeriodOptions(): SelectOption[] {
  const list = useAllExamPeriods()
  return useMemo(() => toOptions(list.data), [list.data])
}

/** Live id -> name lookups for table cells, replacing the old fixed mock curriculum. */
export function useCurriculumNames() {
  const grades = useAcademicList<Grade>('grades', {})
  const terms = useAllExamPeriods()

  const gradeById = new Map((grades.data ?? []).map((grade) => [grade.id, grade.name]))
  const termById = new Map((terms.data ?? []).map((term) => [term.id, term.name]))

  return {
    gradeName: (id: string) => gradeById.get(id) ?? id,
    termName: (id: string) => termById.get(id) ?? id,
  }
}
