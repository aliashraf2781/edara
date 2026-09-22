import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { formatPercent, formatScore } from '~/lib/format'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Modal } from '~/ui/modal'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { Spinner } from '~/ui/spinner'
import { adminText } from '../../admin.i18n'
import { useAdminReference, useSchoolStats, useSchoolStudent, useSchoolStudents } from '../../api/insights'
import { PERMISSION } from '../../api/permissions'
import type { GradeStat, SchoolStudentRow, SubjectStat } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { narrowFilters, type FilterKey } from './filters'
import { ReportCardTable } from './report-card-table'
import { resultsText } from './results.i18n'
import { ResultsToolbar } from './results-toolbar'
import { SchoolNav } from './school-nav'
import { StatCards } from './stat-cards'

const PER_PAGE = 25
const DEFAULTS = { term: '', grade: '', classroom: '', subject: '', search: '' } as const
// No subject filter — this screen lists students, not one row per subject,
// and a subject only means something once a grade narrows which one.
const TOOLBAR_FIELDS: readonly FilterKey[] = ['search', 'term', 'grade', 'classroom']

export function SchoolResultsScreen() {
  const text = useDict(resultsText)
  const shell = useDict(adminText)
  const navigate = useNavigate()
  const { can } = useAdminSession()
  const code = useParams().code ?? ''
  const { values, page, setValue, setPage, clear } = useTableParams(DEFAULTS)
  const search = useDebouncedValue(values.search)
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null)

  const allowed = can(PERMISSION.viewTenant) || can(PERMISSION.viewTenants)
  const reference = useAdminReference(code)
  const filters = narrowFilters(reference.data, values)
  const stats = useSchoolStats(code, filters.term, allowed)
  const students = useSchoolStudents(
    code,
    { page, perPage: PER_PAGE, search, gradeId: filters.grade, classroomId: filters.classroom },
    allowed,
  )
  const detail = useSchoolStudent(code, selected?.id ?? '', selected !== null)

  if (!allowed) {
    return <NoAccess title={text.school.resultsTitle} description={shell.guard.noAccess} />
  }

  const selectedTerm = detail.data?.terms.find((term) => term.term_id === filters.term)

  const hasFilters = Object.values(values).some((value) => value !== '')

  const columns: readonly Column<SchoolStudentRow>[] = [
    { key: 'name', header: text.school.studentColumns.name, cell: (row) => row.name },
    {
      key: 'code',
      header: text.school.studentColumns.code,
      cell: (row) => (
        <span className="font-mono text-small" dir="ltr">
          {row.student_code}
        </span>
      ),
    },
    { key: 'grade', header: text.school.studentColumns.grade, cell: (row) => row.grade_name },
    {
      key: 'classroom',
      header: text.school.studentColumns.classroom,
      cell: (row) => row.classroom_name,
    },
  ]

  const gradeColumns: readonly Column<GradeStat>[] = [
    { key: 'grade', header: text.school.gradeColumns.grade, cell: (row) => row.grade_name },
    {
      key: 'students',
      header: text.school.gradeColumns.students,
      numeric: true,
      cell: (row) => row.students,
    },
    {
      key: 'results',
      header: text.school.gradeColumns.results,
      numeric: true,
      cell: (row) => row.total,
    },
    {
      key: 'passed',
      header: text.school.gradeColumns.passed,
      numeric: true,
      cell: (row) => row.passed,
    },
    {
      key: 'passRate',
      header: text.school.gradeColumns.passRate,
      numeric: true,
      cell: (row) => formatPercent(row.passed, row.total),
    },
    {
      key: 'average',
      header: text.school.gradeColumns.average,
      numeric: true,
      cell: (row) => formatScore(row.average),
    },
  ]

  const subjectColumns: readonly Column<SubjectStat>[] = [
    { key: 'subject', header: text.school.subjectColumns.subject, cell: (row) => row.subject_name },
    {
      key: 'type',
      header: text.school.subjectColumns.type,
      cell: (row) => text.school.gradingType[row.grading_type],
    },
    {
      key: 'results',
      header: text.school.subjectColumns.results,
      numeric: true,
      cell: (row) => row.total,
    },
    {
      key: 'passed',
      header: text.school.subjectColumns.passed,
      numeric: true,
      cell: (row) => row.passed,
    },
    {
      key: 'passRate',
      header: text.school.subjectColumns.passRate,
      numeric: true,
      cell: (row) => formatPercent(row.passed, row.total),
    },
    {
      key: 'average',
      header: text.school.subjectColumns.average,
      numeric: true,
      // A pass/fail subject has no mean to report, only a pass count.
      cell: (row) => (row.grading_type === 'numeric' ? formatScore(row.average) : '—'),
    },
  ]

  const figures = stats.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={figures?.name ?? code}
        description={text.school.resultsDescription}
        meta={
          <span className="font-mono text-small text-muted" dir="ltr">
            {code}
          </span>
        }
        actions={
          <Button onClick={() => navigate(`/admin/schools/${code}`)}>
            {text.school.backToSchool}
          </Button>
        }
      />

      <SchoolNav code={code} label={figures?.name ?? code} />

      <ResultsToolbar
        reference={reference.data}
        fields={TOOLBAR_FIELDS}
        values={filters}
        onChange={(key, value) => setValue(key, value)}
      />

      {figures ? (
        <StatCards
          items={[
            { label: text.overview.stats.students, value: String(figures.students) },
            { label: text.overview.stats.results, value: String(figures.results) },
            {
              label: text.overview.stats.passRate,
              value: formatPercent(figures.passed, figures.results),
            },
            { label: text.overview.stats.average, value: formatScore(figures.average) },
          ]}
          className="xl:grid-cols-4"
        />
      ) : null}

      {students.isError ? (
        <ErrorState
          error={students.error}
          onRetry={() => void students.refetch()}
          labels={shell.error}
        />
      ) : (
        <>
          <DataTable
            caption={text.school.resultsTitle}
            columns={columns}
            rows={students.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowActivate={(row) => setSelected({ id: row.id, name: row.name })}
            isLoading={students.isLoading}
            empty={
              <EmptyState
                title={hasFilters ? text.school.noResultsTitle : text.school.emptyTitle}
                description={hasFilters ? text.school.noResultsBody : text.school.emptyBody}
                action={hasFilters ? <Button onClick={clear}>{text.filters.clear}</Button> : null}
              />
            }
          />

          {students.data ? (
            <Pagination
              meta={students.data.meta}
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

      {stats.isError ? (
        <ErrorState error={stats.error} onRetry={() => void stats.refetch()} labels={shell.error} />
      ) : null}

      {figures ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-h2 font-semibold text-ink">{text.school.byGrade}</h2>
            <DataTable
              caption={text.school.byGrade}
              columns={gradeColumns}
              rows={figures.byGrade}
              rowKey={(row) => row.grade_id}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-h2 font-semibold text-ink">{text.school.bySubject}</h2>
            <DataTable
              caption={text.school.bySubject}
              columns={subjectColumns}
              rows={figures.bySubject}
              rowKey={(row) => row.subject_id}
            />
          </section>
        </div>
      ) : null}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        description={text.reportCard.title}
        closeLabel={shell.common.close}
      >
        {filters.term === '' ? (
          <p className="text-small text-muted">{text.reportCard.pickTermPrompt}</p>
        ) : detail.isError ? (
          <ErrorState error={detail.error} onRetry={() => void detail.refetch()} labels={shell.error} />
        ) : detail.isPending ? (
          <div className="flex items-center gap-3 text-muted">
            <Spinner className="text-accent" label={shell.guard.loading} />
            <p className="text-small">{shell.guard.loading}</p>
          </div>
        ) : (
          <ReportCardTable subjects={selectedTerm?.subjects ?? []} />
        )}
      </Modal>
    </div>
  )
}
