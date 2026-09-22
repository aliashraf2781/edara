import { useNavigate, useParams } from 'react-router'
import { formatDate, formatScore } from '~/lib/format'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DataTable, type Column } from '~/ui/data-table'
import { DefinitionList } from '~/ui/definition-list'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Spinner } from '~/ui/spinner'
import { adminText } from '../../admin.i18n'
import { useSchoolStudent } from '../../api/insights'
import { PERMISSION } from '../../api/permissions'
import type { StudentTermStats, StudentTermSubject } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { MarkCell, VerdictStamp } from './result-cells'
import { resultsText } from './results.i18n'
import { StatCards } from './stat-cards'

export function StudentStatsScreen() {
  const text = useDict(resultsText)
  const shell = useDict(adminText)
  const { locale } = useLocale()
  const navigate = useNavigate()
  const { can } = useAdminSession()
  const params = useParams()
  const code = params.code ?? ''
  const id = params.id ?? ''

  const allowed = can(PERMISSION.viewTenant) || can(PERMISSION.viewTenants)
  const detail = useSchoolStudent(code, id, allowed)

  if (!allowed) return <NoAccess title={text.student.identity} description={shell.guard.noAccess} />

  if (detail.isPending) {
    return (
      <div className="flex items-center gap-3 text-muted">
        <Spinner className="text-accent" label={shell.guard.loading} />
        <p className="text-small">{shell.guard.loading}</p>
      </div>
    )
  }

  if (detail.isError) {
    return <ErrorState error={detail.error} onRetry={() => void detail.refetch()} labels={shell.error} />
  }

  const { student, grade_name, classroom_name, terms, school } = detail.data
  const name = [student.first_name, student.father_name, student.family_name]
    .filter((part) => part !== '')
    .join(' ')
  const verdicts = { passed: text.student.passed, failed: text.student.failed }
  const overallPassed = terms.length > 0 && terms.every((term) => term.verdict === 'passed')

  const columns: readonly Column<StudentTermSubject>[] = [
    { key: 'subject', header: text.student.subjectColumns.subject, cell: (row) => row.subject_name },
    {
      key: 'mark',
      header: text.student.subjectColumns.mark,
      numeric: true,
      cell: (row) => <MarkCell value={row} />,
    },
    {
      key: 'finalMark',
      header: text.student.subjectColumns.finalMark,
      numeric: true,
      cell: (row) => (row.max_score === null ? '—' : row.max_score),
    },
    {
      key: 'minMark',
      header: text.student.subjectColumns.minMark,
      numeric: true,
      cell: (row) => (row.pass_score === null ? '—' : row.pass_score),
    },
    {
      key: 'verdict',
      header: text.student.subjectColumns.verdict,
      cell: (row) => <VerdictStamp passed={row.passed} labels={verdicts} />,
    },
  ]

  const termFigures = (term: StudentTermStats) => [
    { label: text.student.totals.total, value: String(term.total) },
    { label: text.student.totals.outOf, value: String(term.out_of) },
    { label: text.student.totals.percent, value: `${term.percent.toFixed(1)}%` },
    { label: text.student.totals.average, value: formatScore(term.average) },
    {
      label: text.student.totals.subjectsPassed,
      value: `${term.passed} / ${term.subjects.length}`,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={name}
        description={text.student.description}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-small text-muted" dir="ltr">
              {student.student_code}
            </span>
            <VerdictStamp passed={overallPassed} labels={verdicts} />
          </div>
        }
        actions={
          <>
            <Button onClick={() => navigate(`/admin/schools/${code}/students`)}>
              {text.school.backToSchool}
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/admin/schools/${code}/students/${id}/print`)}
            >
              <Icon name="sheet" />
              {text.student.print}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader title={text.student.identity} />
        <CardBody>
          <DefinitionList
            columns={3}
            items={[
              { term: text.student.code, value: student.student_code, mono: true },
              { term: text.student.seat, value: student.seat_no, mono: true },
              { term: text.student.nationalId, value: student.national_id, mono: true },
              { term: text.student.gender, value: text.student.genders[student.gender] },
              { term: text.student.birthDate, value: formatDate(student.birth_date, locale) },
              { term: text.student.grade, value: grade_name },
              { term: text.student.classroom, value: classroom_name },
              { term: text.student.school, value: school.name },
            ]}
          />
        </CardBody>
      </Card>

      {terms.length === 0 ? (
        <EmptyState title={text.student.noTerms} description={text.student.noTermsBody} />
      ) : (
        terms.map((term) => (
          <section key={term.term_id} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-h1 font-semibold text-ink">{term.term_name}</h2>
              <div className="flex items-center gap-3">
                <span className="label-micro">{text.student.verdict}</span>
                <VerdictStamp passed={term.verdict === 'passed'} labels={verdicts} />
              </div>
            </div>

            <StatCards items={termFigures(term)} />

            <DataTable
              caption={`${name} — ${term.term_name}`}
              columns={columns}
              rows={term.subjects}
              rowKey={(row) => row.subject_id}
            />
          </section>
        ))
      )}
    </div>
  )
}
