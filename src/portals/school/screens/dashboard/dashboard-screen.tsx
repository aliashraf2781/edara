import { Link } from 'react-router'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { Select } from '~/ui/select'
import { useYearOptions } from '../../api/use-options'
import { useSchoolSession } from '../../auth/session-context'
import { ExamPeriodField } from '../../components/exam-period-field'
import { reportsText } from '../reports/reports.i18n'
import { SummaryPanel } from '../reports/summary-panel'

const DEFAULTS = { year: '', examPeriod: '' } as const

/** The landing screen is the reports summary, without the per-grade table. */
export function DashboardScreen() {
  const text = useDict(reportsText)
  const { school } = useSchoolSession()
  const { values, setValue } = useTableParams(DEFAULTS)
  const years = useYearOptions()

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
      <Field label={text.year} className="max-w-xs">
        {(props) => (
          <Select
            {...props}
            value={values.year}
            onChange={(event) => {
              setValue('year', event.target.value)
              setValue('examPeriod', '')
            }}
            options={years}
            placeholder={text.pickYear}
          />
        )}
      </Field>
      <ExamPeriodField
        academicYearId={values.year}
        value={values.examPeriod}
        onChange={(value) => setValue('examPeriod', value)}
      />
      <SummaryPanel examPeriodId={values.examPeriod} showByGrade={false} />
    </div>
  )
}
