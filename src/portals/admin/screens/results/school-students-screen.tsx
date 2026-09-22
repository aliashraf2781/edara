import { useNavigate, useParams } from 'react-router'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { adminText } from '../../admin.i18n'
import { useAdminReference, useSchoolStats, useSchoolStudents } from '../../api/insights'
import { PERMISSION } from '../../api/permissions'
import type { SchoolStudentRow } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { narrowFilters, type FilterKey } from './filters'
import { resultsText } from './results.i18n'
import { ResultsToolbar } from './results-toolbar'
import { SchoolNav } from './school-nav'

const PER_PAGE = 25
const DEFAULTS = { grade: '', classroom: '', search: '' } as const
const FIELDS: readonly FilterKey[] = ['search', 'grade', 'classroom']

export function SchoolStudentsScreen() {
  const text = useDict(resultsText)
  const shell = useDict(adminText)
  const navigate = useNavigate()
  const { can } = useAdminSession()
  const code = useParams().code ?? ''
  const { values, page, setValue, setPage, clear } = useTableParams(DEFAULTS)
  const search = useDebouncedValue(values.search)

  const allowed = can(PERMISSION.viewTenant) || can(PERMISSION.viewTenants)
  const reference = useAdminReference(code)
  const filters = narrowFilters(reference.data, { ...values, term: '', subject: '' })
  const stats = useSchoolStats(code, '', allowed)
  const students = useSchoolStudents(
    code,
    { page, perPage: PER_PAGE, search, gradeId: filters.grade, classroomId: filters.classroom },
    allowed,
  )

  if (!allowed) {
    return <NoAccess title={text.school.studentsTitle} description={shell.guard.noAccess} />
  }

  const hasFilters = Object.values(values).some((value) => value !== '')
  const openStudent = (row: SchoolStudentRow) =>
    navigate(`/admin/schools/${code}/students/${row.id}`)

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
    {
      key: 'seat',
      header: text.school.studentColumns.seat,
      numeric: true,
      cell: (row) => row.seat_no,
    },
    { key: 'grade', header: text.school.studentColumns.grade, cell: (row) => row.grade_name },
    {
      key: 'classroom',
      header: text.school.studentColumns.classroom,
      cell: (row) => row.classroom_name,
    },
    {
      key: 'actions',
      header: text.school.studentColumns.actions,
      cell: (row) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" onClick={() => openStudent(row)}>
            {text.school.view}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={stats.data?.name ?? code}
        description={text.school.studentsDescription}
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

      <SchoolNav code={code} label={stats.data?.name ?? code} />

      <ResultsToolbar
        reference={reference.data}
        fields={FIELDS}
        values={filters}
        onChange={(key, value) => {
          if (key === 'term' || key === 'subject') return
          setValue(key, value)
        }}
      />

      {students.isError ? (
        <ErrorState
          error={students.error}
          onRetry={() => void students.refetch()}
          labels={shell.error}
        />
      ) : (
        <>
          <DataTable
            caption={text.school.studentsTitle}
            columns={columns}
            rows={students.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowActivate={openStudent}
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
    </div>
  )
}
