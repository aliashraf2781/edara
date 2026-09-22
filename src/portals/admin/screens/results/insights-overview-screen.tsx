import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { formatPercent, formatScore } from '~/lib/format'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Select } from '~/ui/select'
import { adminText } from '../../admin.i18n'
import { useAdminReference, useSchoolInsights } from '../../api/insights'
import { PERMISSION } from '../../api/permissions'
import type { SchoolStats } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { resultsText } from './results.i18n'
import { StatCards } from './stat-cards'

const DEFAULTS = { term: '' } as const

export function InsightsOverviewScreen() {
  const text = useDict(resultsText)
  const shell = useDict(adminText)
  const navigate = useNavigate()
  const { can } = useAdminSession()
  const { values, setValue } = useTableParams(DEFAULTS)

  const allowed = can(PERMISSION.viewTenants)
  // No single school in view here — there is no cross-school reference
  // to ask for (see useAdminReference), so this stays empty until the
  // term picker gets its own cross-school design (matching by label,
  // like the bulk archive and school-insights endpoints already do).
  const reference = useAdminReference('')
  const insights = useSchoolInsights(values.term)

  const rows = useMemo(
    () => [...(insights.data ?? [])].sort((a, b) => b.passRate - a.passRate),
    [insights.data],
  )

  const totals = useMemo(() => {
    const students = rows.reduce((sum, row) => sum + row.students, 0)
    const results = rows.reduce((sum, row) => sum + row.results, 0)
    const passed = rows.reduce((sum, row) => sum + row.passed, 0)
    // Each school's average covers its own marks, so the platform figure is
    // weighted by how many marks each school contributed.
    const weighted = rows.reduce((sum, row) => sum + row.average * row.results, 0)
    return {
      students,
      results,
      passed,
      average: results === 0 ? 0 : weighted / results,
    }
  }, [rows])

  if (!allowed) {
    return <NoAccess title={text.overview.title} description={shell.guard.noAccess} />
  }

  const termOptions = (reference.data?.terms ?? []).map((term) => ({
    value: term.id,
    label: term.name,
  }))

  const columns: readonly Column<SchoolStats>[] = [
    { key: 'school', header: text.overview.columns.school, cell: (row) => row.name },
    {
      key: 'code',
      header: text.overview.columns.code,
      cell: (row) => (
        <span className="font-mono text-small" dir="ltr">
          {row.code}
        </span>
      ),
    },
    {
      key: 'students',
      header: text.overview.columns.students,
      numeric: true,
      cell: (row) => row.students,
    },
    {
      key: 'results',
      header: text.overview.columns.results,
      numeric: true,
      cell: (row) => row.results,
    },
    {
      key: 'passRate',
      header: text.overview.columns.passRate,
      numeric: true,
      cell: (row) => formatPercent(row.passed, row.results),
    },
    {
      key: 'average',
      header: text.overview.columns.average,
      numeric: true,
      cell: (row) => formatScore(row.average),
    },
    {
      key: 'actions',
      header: text.overview.columns.actions,
      cell: (row) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" onClick={() => navigate(`/admin/schools/${row.code}/results`)}>
            {text.overview.open}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.overview.title}
        description={text.overview.description}
        actions={
          <Select
            aria-label={text.filters.term}
            className="min-w-48"
            options={termOptions}
            placeholder={text.filters.allTerms}
            value={values.term}
            onChange={(event) => setValue('term', event.target.value)}
          />
        }
      />

      <StatCards
        items={[
          { label: text.overview.stats.schools, value: String(rows.length) },
          { label: text.overview.stats.students, value: String(totals.students) },
          { label: text.overview.stats.results, value: String(totals.results) },
          {
            label: text.overview.stats.passRate,
            value: formatPercent(totals.passed, totals.results),
          },
          { label: text.overview.stats.average, value: formatScore(totals.average) },
        ]}
      />

      {insights.isError ? (
        <ErrorState
          error={insights.error}
          onRetry={() => void insights.refetch()}
          labels={shell.error}
        />
      ) : (
        <DataTable
          caption={text.overview.title}
          columns={columns}
          rows={rows}
          rowKey={(row) => row.code}
          onRowActivate={(row) => navigate(`/admin/schools/${row.code}/results`)}
          isLoading={insights.isLoading}
          empty={
            <EmptyState title={text.overview.emptyTitle} description={text.overview.emptyBody} />
          }
        />
      )}
    </div>
  )
}
