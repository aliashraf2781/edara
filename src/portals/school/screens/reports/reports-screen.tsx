import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { PageHeader } from '~/ui/page-header'
import { Select } from '~/ui/select'
import { useYearOptions } from '../../api/use-options'
import { ExamPeriodField } from '../../components/exam-period-field'
import { reportsText } from './reports.i18n'
import { SummaryPanel } from './summary-panel'

const DEFAULTS = { year: '', examPeriod: '' } as const

export function ReportsScreen() {
  const text = useDict(reportsText)
  // In the URL, so a report for one period can be linked to and reloaded.
  const { values, setValue } = useTableParams(DEFAULTS)
  const years = useYearOptions()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />
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
      <SummaryPanel examPeriodId={values.examPeriod} showByGrade />
    </div>
  )
}
