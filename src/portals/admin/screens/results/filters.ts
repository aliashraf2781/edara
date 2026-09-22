import type { AdminReference } from '../../api/types'

export type FilterKey = 'term' | 'grade' | 'classroom' | 'subject' | 'search'
export type FilterValues = Record<FilterKey, string>

/**
 * A classroom or subject belonging to another grade would filter the table to
 * nothing, so switching grade drops both. It is resolved rather than written
 * back, because `setSearchParams` does not compose within one handler — two
 * writes in a row would keep only the last.
 */
export function narrowFilters(
  reference: AdminReference | undefined,
  values: FilterValues,
): FilterValues {
  if (values.grade === '') return values

  const inGrade = (list: readonly { id: string; grade_id: string }[], id: string) =>
    id === '' || list.some((row) => row.id === id && row.grade_id === values.grade)

  return {
    ...values,
    classroom: inGrade(reference?.classrooms ?? [], values.classroom) ? values.classroom : '',
    subject: inGrade(reference?.subjects ?? [], values.subject) ? values.subject : '',
  }
}
