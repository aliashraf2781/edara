import { useDict } from '~/lib/i18n/use-dict'
import { EmptyState } from '~/ui/empty-state'
import { Stamp } from '~/ui/stamp'
import type { StudentTermSubject } from '../../api/types'
import { studentsText } from './students.i18n'

const QUALITATIVE_LABEL: Record<string, string> = {
  exceeds_expectations: 'يفوق التوقعات',
  meets_expectations: 'التوقعات',
  sometimes_meets_expectations: 'أحيانا التوقعات',
  below_expectations: 'أقل من التوقعات',
}

/**
 * The printed report-card layout: subjects run across as columns, the
 * fixed rows (full mark, pass mark, the student's own mark, pass/fail)
 * run down — the transpose of every other table in this app, which is
 * why this isn't built on the shared DataTable (rows there are records,
 * not a fixed set of labels).
 */
export function ReportCardTable({
  subjects,
  onEditSubject,
}: {
  subjects: StudentTermSubject[]
  /** Omitted where the report card is read-only (e.g. the printed extract). */
  onEditSubject?: (subject: StudentTermSubject) => void
}) {
  const text = useDict(studentsText).reportCard

  if (subjects.length === 0) {
    return <EmptyState title={text.title} description={text.empty} />
  }

  const scoreCell = (subject: StudentTermSubject) => {
    if (subject.is_absent) return text.absent
    if (subject.grading_type === 'qualitative') {
      return subject.qualitative_rating ? QUALITATIVE_LABEL[subject.qualitative_rating] : text.none
    }
    return subject.score ?? text.none
  }

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-xs">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">{text.title}</caption>
        <thead>
          <tr className="border-b border-line-strong">
            <th scope="col" className="label-micro sticky start-0 z-10 whitespace-nowrap bg-sunken px-4 py-3 text-start">
              {text.rows.score}
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
              {text.rows.max}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center font-mono">
                {subject.grading_type === 'numeric' ? (subject.max_score ?? text.none) : text.none}
              </td>
            ))}
          </tr>
          <tr className="h-11 border-b border-line">
            <th scope="row" className="sticky start-0 z-10 bg-surface px-4 text-start font-medium text-ink">
              {text.rows.pass}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center font-mono">
                {subject.grading_type === 'numeric' ? (subject.pass_score ?? text.none) : text.none}
              </td>
            ))}
          </tr>
          <tr className="h-11 border-b border-line">
            <th scope="row" className="sticky start-0 z-10 bg-surface px-4 text-start font-medium text-ink">
              {text.rows.score}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center font-mono">
                {onEditSubject ? (
                  <button
                    type="button"
                    onClick={() => onEditSubject(subject)}
                    className="rounded-control px-2 py-1 underline decoration-dotted underline-offset-4 hover:bg-sunken hover:text-accent"
                    title={text.editHint}
                  >
                    {scoreCell(subject)}
                  </button>
                ) : (
                  scoreCell(subject)
                )}
              </td>
            ))}
          </tr>
          <tr className="h-14">
            <th scope="row" className="sticky start-0 z-10 bg-surface px-4 text-start font-medium text-ink">
              {text.rows.verdict}
            </th>
            {subjects.map((subject) => (
              <td key={subject.subject_id} className="px-4 text-center">
                {subject.is_absent ? (
                  <Stamp tone="neutral">{text.absent}</Stamp>
                ) : (
                  <Stamp tone={subject.passed ? 'success' : 'danger'}>
                    {subject.passed ? text.verdicts.passed : text.verdicts.failed}
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
