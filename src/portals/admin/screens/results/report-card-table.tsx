import { useDict } from '~/lib/i18n/use-dict'
import { EmptyState } from '~/ui/empty-state'
import { Stamp } from '~/ui/stamp'
import type { StudentTermSubject } from '../../api/types'
import { resultsText } from './results.i18n'

const QUALITATIVE_LABEL: Record<string, string> = {
  exceeds_expectations: 'يفوق التوقعات',
  meets_expectations: 'التوقعات',
  sometimes_meets_expectations: 'أحيانا التوقعات',
  below_expectations: 'أقل من التوقعات',
}

/**
 * The printed report-card layout: subjects run across as columns, the
 * fixed rows (full mark, pass mark, the student's own mark, verdict) run
 * down. Same shape as the school portal's ReportCardTable — kept as a
 * separate copy here rather than a shared import because the two
 * StudentTermSubject types and i18n dicts live in separate portal trees.
 */
export function ReportCardTable({ subjects }: { subjects: StudentTermSubject[] }) {
  const text = useDict(resultsText)
  const card = text.reportCard
  const verdicts = { passed: text.student.passed, failed: text.student.failed }

  if (subjects.length === 0) {
    return <EmptyState title={card.title} description={text.school.noResultsBody} />
  }

  const scoreCell = (subject: StudentTermSubject) => {
    if (subject.is_absent) return card.absent
    if (subject.grading_type === 'qualitative') {
      return subject.qualitative_rating ? (QUALITATIVE_LABEL[subject.qualitative_rating] ?? subject.qualitative_rating) : card.none
    }
    return subject.score ?? card.none
  }

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-xs">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">{card.title}</caption>
        <thead>
          <tr className="border-b border-line-strong">
            <th scope="col" className="label-micro sticky start-0 z-10 whitespace-nowrap bg-sunken px-4 py-3 text-start">
              {card.rows.score}
            </th>
            {subjects.map((subject) => (
              <th
                key={subject.subject_id}
                scope="col"
                className="label-micro whitespace-nowrap bg-sunken px-4 py-3 text-center"
              >
                {subject.subject_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="h-11 border-b border-line">
            <th scope="row" className="sticky start-0 z-10 bg-surface px-4 text-start font-medium text-ink">
              {card.rows.max}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center font-mono">
                {subject.grading_type === 'numeric' ? (subject.max_score ?? card.none) : card.none}
              </td>
            ))}
          </tr>
          <tr className="h-11 border-b border-line">
            <th scope="row" className="sticky start-0 z-10 bg-surface px-4 text-start font-medium text-ink">
              {card.rows.pass}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center font-mono">
                {subject.grading_type === 'numeric' ? (subject.pass_score ?? card.none) : card.none}
              </td>
            ))}
          </tr>
          <tr className="h-11 border-b border-line">
            <th scope="row" className="sticky start-0 z-10 bg-surface px-4 text-start font-medium text-ink">
              {card.rows.score}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center font-mono">
                {scoreCell(subject)}
              </td>
            ))}
          </tr>
          <tr className="h-14">
            <th scope="row" className="sticky start-0 z-10 bg-surface px-4 text-start font-medium text-ink">
              {card.rows.verdict}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center">
                {subject.is_absent ? (
                  <Stamp tone="neutral">{card.absent}</Stamp>
                ) : (
                  <Stamp tone={subject.passed ? 'success' : 'danger'}>
                    {subject.passed ? verdicts.passed : verdicts.failed}
                  </Stamp>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
