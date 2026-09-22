import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Field } from '~/ui/field'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { Select } from '~/ui/select'
import { Stamp } from '~/ui/stamp'
import { useResultList } from '../../api/results'
import { RESULT_STATUSES, type Result } from '../../api/types'
import { useClassroomOptions, useSubjectOptions } from '../../api/use-options'
import { GradeField, TermField } from '../../components/term-grade-fields'
import { schoolText } from '../../school.i18n'
import { markLabel } from './mark'
import { ResultEntryDrawer } from './result-entry-drawer'
import { resultsText } from './results.i18n'
import { STATUS_TONE } from './workflow'

const PER_PAGE = 20
const DEFAULTS = { term: '', grade: '', classroom: '', subject: '', status: '' } as const

export function ResultsListScreen() {
  const text = useDict(resultsText)
  const shell = useDict(schoolText)
  const navigate = useNavigate()
  const { values, page, setValue, setPage } = useTableParams(DEFAULTS)
  const [entering, setEntering] = useState(false)

  const classrooms = useClassroomOptions({ gradeId: values.grade || undefined })
  const subjects = useSubjectOptions(values.grade || undefined)

  const list = useResultList({
    page,
    perPage: PER_PAGE,
    termId: values.term,
    gradeId: values.grade,
    classroomId: values.classroom,
    subjectId: values.subject,
    status: values.status,
  })

  // Narrowing the grade invalidates whatever classroom or subject was picked.
  const changeGrade = (value: string) => {
    setValue('grade', value)
    setValue('classroom', '')
    setValue('subject', '')
  }

  const markLabels = { absent: text.absent, none: shell.common.none, qualitative: text.qualitative }

  const columns: readonly Column<Result>[] = [
    {
      key: 'student',
      header: text.columns.student,
      cell: (row) => (
        <button
          type="button"
          className="text-start text-accent underline-offset-2 hover:underline"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/school/students/${row.student_id}${values.term ? `?term=${values.term}` : ''}`)
          }}
        >
          {row.student_name}
        </button>
      ),
    },
    {
      key: 'code',
      header: text.columns.code,
      cell: (row) => <span className="font-mono">{row.student_code}</span>,
    },
    { key: 'subject', header: text.columns.subject, cell: (row) => row.subject_name },
    {
      key: 'mark',
      header: text.columns.mark,
      numeric: true,
      cell: (row) =>
        row.is_absent ? (
          <span className="text-muted">{text.absent}</span>
        ) : (
          markLabel(row, markLabels)
        ),
    },
    {
      key: 'status',
      header: text.columns.status,
      cell: (row) => <Stamp tone={STATUS_TONE[row.status]}>{text.statuses[row.status]}</Stamp>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <Button variant="primary" onClick={() => setEntering(true)}>
            <Icon name="plus" />
            {text.newResult}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <TermField value={values.term} onChange={(value) => setValue('term', value)} />
        <GradeField
          value={values.grade}
          onChange={changeGrade}
          placeholder={shell.pickers.allGrades}
        />
        <Field label={text.filters.classroom}>
          {(props) => (
            <Select
              {...props}
              value={values.classroom}
              onChange={(event) => setValue('classroom', event.target.value)}
              options={classrooms}
              placeholder={text.filters.anyClassroom}
            />
          )}
        </Field>
        <Field label={text.filters.subject}>
          {(props) => (
            <Select
              {...props}
              value={values.subject}
              onChange={(event) => setValue('subject', event.target.value)}
              options={subjects}
              placeholder={text.filters.anySubject}
            />
          )}
        </Field>
        {/* A filter, not a setter: choosing a status here never changes one. */}
        <Field label={text.filters.status}>
          {(props) => (
            <Select
              {...props}
              value={values.status}
              onChange={(event) => setValue('status', event.target.value)}
              options={RESULT_STATUSES.map((status) => ({
                value: status,
                label: text.statuses[status],
              }))}
              placeholder={text.filters.anyStatus}
            />
          )}
        </Field>
      </div>

      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} labels={shell.error} />
      ) : (
        <>
          <DataTable
            caption={text.title}
            columns={columns}
            rows={list.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowActivate={(row) => navigate(`/school/results/${row.id}`)}
            isLoading={list.isLoading}
            empty={
              <EmptyState
                title={text.emptyTitle}
                description={text.emptyBody}
                action={
                  <Button variant="primary" onClick={() => setEntering(true)}>
                    {text.newResult}
                  </Button>
                }
              />
            }
          />

          {list.data ? (
            <Pagination
              meta={list.data.meta}
              onPageChange={setPage}
              labels={{
                previous: shell.common.previous,
                next: shell.common.next,
                summary: (meta) =>
                  shell.common.pageSummary(meta.current_page, meta.last_page, meta.total),
              }}
            />
          ) : null}
        </>
      )}

      <ResultEntryDrawer open={entering} onClose={() => setEntering(false)} />
    </div>
  )
}
