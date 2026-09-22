import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { PageHeader } from '~/ui/page-header'
import { GradeField, TermField } from '../../components/term-grade-fields'
import { reportsText } from './reports.i18n'
import { SubjectBreakdownPanel } from './subject-breakdown-panel'
import { SummaryPanel } from './summary-panel'

const DEFAULTS = { term: '', grade: '' } as const

export function ReportsScreen() {
  const text = useDict(reportsText)
  // In the URL, so a report for one term can be linked to and reloaded.
  const { values, setValue } = useTableParams(DEFAULTS)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <TermField value={values.term} onChange={(value) => setValue('term', value)} />
        <GradeField value={values.grade} onChange={(value) => setValue('grade', value)} />
      </div>

      <SummaryPanel termId={values.term} showByGrade />
      <SubjectBreakdownPanel termId={values.term} gradeId={values.grade} />
    </div>
  )
}
