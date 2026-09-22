import { Link } from 'react-router'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { useSchoolSession } from '../../auth/session-context'
import { TermField } from '../../components/term-grade-fields'
import { reportsText } from '../reports/reports.i18n'
import { SummaryPanel } from '../reports/summary-panel'

// No default term — there is no single "current" exam period to assume,
// so the summary simply waits for the operator to pick one.
const DEFAULTS = { term: '' } as const

/** The landing screen is the reports summary, with the per-grade pass rates. */
export function DashboardScreen() {
  const text = useDict(reportsText)
  const { school } = useSchoolSession()
  const { values, setValue } = useTableParams(DEFAULTS)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.dashboardTitle}
        description={`${school.name} — ${text.dashboardDescription}`}
        actions={
          <Link
            to="/school/reports"
            className="inline-flex min-h-10 items-center gap-2 rounded-control border border-line bg-surface px-4 text-body text-ink transition-colors duration-150 ease-out hover:bg-sunken"
          >
            {text.openReports}
            <Icon name="chevronEnd" directional />
          </Link>
        }
      />

      <TermField
        value={values.term}
        onChange={(value) => setValue('term', value)}
        className="max-w-xs"
      />

      <SummaryPanel termId={values.term} showByGrade />
    </div>
  )
}
