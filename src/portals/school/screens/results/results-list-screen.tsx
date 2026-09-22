import { useState } from 'react'
import { useNavigate } from 'react-router'
import { formatScore } from '~/lib/format'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { Select } from '~/ui/select'
import { Stamp } from '~/ui/stamp'
import { useResultList } from '../../api/results'
import { RESULT_STATUSES, type Result } from '../../api/types'
import { useClassroomOptions, useSubjectOptions, useYearOptions } from '../../api/use-options'
import { ExamPeriodField } from '../../components/exam-period-field'
import { schoolText } from '../../school.i18n'
import { ResultEntryDrawer } from './result-entry-drawer'
import { resultsText } from './results.i18n'
import { STATUS_TONE } from './workflow'

const PER_PAGE = 20
const DEFAULTS = { year: '', examPeriod: '', classroom: '', subject: '', status: '' } as const

export function ResultsListScreen() {
  const text = useDict(resultsText)
  const shell = useDict(schoolText)
  const navigate = useNavigate()
  const { values, page, setValue, setPage } = useTableParams(DEFAULTS)
  const [entering, setEntering] = useState(false)

  const years = useYearOptions()
  const classrooms = useClassroomOptions({})
  const subjects = useSubjectOptions()

  const list = useResultList({
    page,
    perPage: PER_PAGE,
    examPeriodId: values.examPeriod,
    classroomId: values.classroom,
    subjectId: values.subject,
    status: values.status,
  })

  const columns: readonly Column<Result>[] = [
    {
      key: 'student',
      header: text.columns.student,
      cell: (row) => row.student_name ?? row.student_enrollment_id,
    },
    { key: 'subject', header: text.columns.subject, cell: (row) => row.subject_name ?? row.subject_id },
    {
      key: 'score',
      header: text.columns.score,
      numeric: true,
      cell: (row) =>
        row.is_absent ? (
          <span className="text-muted">{text.absent}</span>
        ) : row.qualitative_rating ? (
          text.ratings[row.qualitative_rating]
        ) : (
          formatScore(row.score)
        ),
    },
    {
      key: 'max',
      header: text.columns.maxScore,
      numeric: true,
      cell: (row) => (row.qualitative_rating ? '—' : row.max_score),
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            aria-label={text.filters.year}
            value={values.year}
            onChange={(event) => {
              setValue('year', event.target.value)
              setValue('examPeriod', '')
            }}
            options={years}
            placeholder={text.filters.year}
          />
          <ExamPeriodField
            academicYearId={values.year}
            value={values.examPeriod}
            onChange={(value) => setValue('examPeriod', value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            aria-label={text.filters.classroom}
            value={values.classroom}
            onChange={(event) => setValue('classroom', event.target.value)}
            options={classrooms}
            placeholder={text.filters.classroom}
          />
          <Select
            aria-label={text.filters.subject}
            value={values.subject}
            onChange={(event) => setValue('subject', event.target.value)}
            options={subjects}
            placeholder={text.filters.subject}
          />
          {/* A filter, not a setter: choosing a status here never changes one. */}
          <Select
            aria-label={text.filters.status}
            value={values.status}
            onChange={(event) => setValue('status', event.target.value)}
            options={RESULT_STATUSES.map((status) => ({
              value: status,
              label: text.statuses[status],
            }))}
            placeholder={text.filters.anyStatus}
          />
        </div>
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
