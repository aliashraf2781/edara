import { useMemo } from 'react'
import { formatPercent, formatScore } from '~/lib/format'
import { useDict } from '~/lib/i18n/use-dict'
import { subjectsForGrade } from '~/lib/curriculum'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DataTable, type Column } from '~/ui/data-table'
import { ErrorState } from '~/ui/error-state'
import type { GradingType } from '../../api/types'
import { useGradeTermResults } from '../../api/results'
import { schoolText } from '../../school.i18n'
import { reportsText } from './reports.i18n'

type SubjectRow = {
  subject_id: string
  subject_name: string
  grading_type: GradingType
  total: number
  passed: number
  /** Null for the pass/fail subjects, which carry no mark to average. */
  average: number | null
}

/**
 * The summary endpoint stops at the grade, so the subject split is folded from
 * one page of that grade's marks rather than a query per subject.
 */
export function SubjectBreakdownPanel({ termId, gradeId }: { termId: string; gradeId: string }) {
  const text = useDict(reportsText)
  const shell = useDict(schoolText)
  const results = useGradeTermResults(termId, gradeId)

  const rows = useMemo<SubjectRow[]>(() => {
    const marks = results.data ?? []
    return subjectsForGrade(gradeId).map((subject) => {
      const own = marks.filter((mark) => mark.subject_id === subject.id)
      const scored = own.filter((mark) => mark.score !== null)
      return {
        subject_id: subject.id,
        subject_name: subject.name,
        grading_type: subject.grading_type,
        total: own.length,
        passed: own.filter((mark) => mark.passed).length,
        average:
          subject.grading_type === 'qualitative' || scored.length === 0
            ? null
            : scored.reduce((sum, mark) => sum + (mark.score ?? 0), 0) / scored.length,
      }
    })
  }, [results.data, gradeId])

  if (results.isError) {
    return <ErrorState error={results.error} onRetry={() => void results.refetch()} labels={shell.error} />
  }

  const columns: readonly Column<SubjectRow>[] = [
    { key: 'subject', header: text.subjectColumns.subject, cell: (row) => row.subject_name },
    {
      key: 'type',
      header: text.subjectColumns.gradingType,
      cell: (row) => text.gradingTypes[row.grading_type],
    },
    { key: 'total', header: text.subjectColumns.total, numeric: true, cell: (row) => row.total },
    { key: 'passed', header: text.subjectColumns.passed, numeric: true, cell: (row) => row.passed },
    {
      key: 'rate',
      header: text.subjectColumns.passRate,
      numeric: true,
      cell: (row) => formatPercent(row.passed, row.total),
    },
    {
      key: 'average',
      header: text.subjectColumns.average,
      numeric: true,
      cell: (row) => (row.average === null ? shell.common.none : formatScore(row.average)),
    },
  ]

  return (
    <Card>
      <CardHeader title={text.bySubject} />
      <CardBody className="flex flex-col gap-4 p-0">
        <p className="px-6 pt-4 text-small text-muted">{text.bySubjectHint}</p>
        <DataTable
          caption={text.bySubject}
          columns={columns}
          rows={rows}
          rowKey={(row) => row.subject_id}
          isLoading={results.isPending}
        />
      </CardBody>
    </Card>
  )
}
