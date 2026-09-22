import { useDict } from '~/lib/i18n/use-dict'
import { SearchInput } from '~/ui/search-input'
import { Select, type SelectOption } from '~/ui/select'
import type { AdminReference } from '../../api/types'
import type { FilterKey, FilterValues } from './filters'
import { resultsText } from './results.i18n'

type ToolbarProps = {
  reference: AdminReference | undefined
  values: FilterValues
  /** Trimmed down on the students screen, which has no term or subject. */
  fields?: readonly FilterKey[]
  onChange: (key: FilterKey, value: string) => void
}

const ALL_FIELDS: readonly FilterKey[] = ['search', 'term', 'grade', 'classroom', 'subject']

export function ResultsToolbar({ reference, values, fields = ALL_FIELDS, onChange }: ToolbarProps) {
  const text = useDict(resultsText)

  const classrooms = (reference?.classrooms ?? []).filter(
    (room) => values.grade === '' || room.grade_id === values.grade,
  )
  const subjects = (reference?.subjects ?? []).filter(
    (subject) => values.grade === '' || subject.grade_id === values.grade,
  )

  const option = (value: string, label: string): SelectOption => ({ value, label })
  const show = (key: FilterKey) => fields.includes(key)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {show('search') ? (
        <SearchInput
          label={text.filters.searchHint}
          value={values.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
      ) : null}

      {show('term') ? (
        <Select
          aria-label={text.filters.term}
          placeholder={text.filters.allTerms}
          value={values.term}
          onChange={(event) => onChange('term', event.target.value)}
          options={(reference?.terms ?? []).map((term) => option(term.id, term.name))}
        />
      ) : null}

      {show('grade') ? (
        <Select
          aria-label={text.filters.grade}
          placeholder={text.filters.allGrades}
          value={values.grade}
          onChange={(event) => onChange('grade', event.target.value)}
          options={(reference?.grades ?? []).map((grade) => option(grade.id, grade.name))}
        />
      ) : null}

      {show('classroom') ? (
        <Select
          aria-label={text.filters.classroom}
          placeholder={text.filters.allClassrooms}
          value={values.classroom}
          onChange={(event) => onChange('classroom', event.target.value)}
          options={classrooms.map((room) => option(room.id, room.name))}
        />
      ) : null}

      {show('subject') ? (
        <Select
          aria-label={text.filters.subject}
          placeholder={text.filters.allSubjects}
          value={values.subject}
          onChange={(event) => onChange('subject', event.target.value)}
          options={subjects.map((subject) => option(subject.id, subject.name))}
        />
      ) : null}
    </div>
  )
}
