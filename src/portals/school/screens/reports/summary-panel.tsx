import { formatPercent, formatScore } from '~/lib/format'
import { useDict } from '~/lib/i18n/use-dict'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { Spinner } from '~/ui/spinner'
import { useReportSummary } from '../../api/reports'
import type { ReportSummary } from '../../api/types'
import { useCurriculumNames } from '../../api/use-options'
import { schoolText } from '../../school.i18n'
import { reportsText } from './reports.i18n'

type GradeRow = ReportSummary['byGrade'][number]

/** Headline figure plus its comparison — a number with no context says little. */
function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-card border border-line bg-surface px-6 py-5">
      <span className="label-micro">{label}</span>
      <span className="font-mono text-display text-ink">{value}</span>
      {detail ? <span className="text-small text-muted">{detail}</span> : null}
    </div>
  )
}

export function SummaryPanel({ termId, showByGrade }: { termId: string; showByGrade: boolean }) {
  const text = useDict(reportsText)
  const shell = useDict(schoolText)
  const summary = useReportSummary(termId)
  const { gradeName } = useCurriculumNames()

  if (summary.isPending) {
    return (
      <div className="flex items-center gap-3 text-muted">
        <Spinner className="text-accent" label={shell.guard.loading} />
        <p className="text-small">{shell.guard.loading}</p>
      </div>
    )
  }

  if (summary.isError) {
    return <ErrorState error={summary.error} onRetry={() => void summary.refetch()} labels={shell.error} />
  }

  const { overall, byGrade } = summary.data

  if (overall.total === 0) {
    return <EmptyState title={text.noData} description={text.emptyBody} />
  }

  const columns: readonly Column<GradeRow>[] = [
    { key: 'grade', header: text.columns.grade, cell: (row) => gradeName(row.grade_id) },
    { key: 'total', header: text.columns.total, numeric: true, cell: (row) => row.total },
    { key: 'passed', header: text.columns.passed, numeric: true, cell: (row) => row.passed },
    {
      key: 'rate',
      header: text.columns.passRate,
      numeric: true,
      cell: (row) => formatPercent(row.passed, row.total),
    },
    {
      key: 'average',
      header: text.columns.average,
      numeric: true,
      cell: (row) => formatScore(row.average),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <p className="flex items-start gap-2 text-small text-muted">
        <Icon name="info" className="size-4" />
        {text.publishedOnly}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={text.stats.passRate}
          value={formatPercent(overall.passed, overall.total)}
          detail={`${overall.passed} / ${overall.total}`}
        />
        <StatCard label={text.stats.average} value={formatScore(overall.average)} />
        <StatCard label={text.stats.total} value={String(overall.total)} />
      </div>

      {showByGrade ? (
        <Card>
          <CardHeader title={text.byGrade} />
          <CardBody className="p-0">
            <DataTable
              caption={text.byGrade}
              columns={columns}
              rows={byGrade}
              rowKey={(row) => row.grade_id}
            />
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
