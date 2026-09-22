import { useState } from 'react'
import { useParams } from 'react-router'
import { formatDate } from '~/lib/format'
import { useLocale } from '~/lib/i18n/locale-context'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { DataTable, type Column } from '~/ui/data-table'
import { DefinitionList } from '~/ui/definition-list'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { Spinner } from '~/ui/spinner'
import { useEnrollments, useStudent } from '../../api/students'
import type { Enrollment } from '../../api/types'
import { useClassroomOptions, useGradeOptions, useYearOptions } from '../../api/use-options'
import { schoolText } from '../../school.i18n'
import { EnrollDrawer } from './enroll-drawer'
import { StudentDrawer } from './student-drawer'
import { fullName } from './student-name'
import { studentsText } from './students.i18n'

const labelFor = (options: readonly { value: string; label: string }[], id: string) =>
  options.find((option) => option.value === id)?.label ?? id

export function StudentDetailScreen() {
  const text = useDict(studentsText)
  const shell = useDict(schoolText)
  const { locale } = useLocale()
  const id = useParams().id ?? ''

  const student = useStudent(id)
  const enrollments = useEnrollments(id)
  const years = useYearOptions()
  const grades = useGradeOptions()
  const classrooms = useClassroomOptions({})

  const [editing, setEditing] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  if (student.isPending) {
    return (
      <div className="flex items-center gap-3 text-muted">
        <Spinner className="text-accent" label={shell.guard.loading} />
        <p className="text-small">{shell.guard.loading}</p>
      </div>
    )
  }

  if (student.isError) {
    return <ErrorState error={student.error} onRetry={() => void student.refetch()} labels={shell.error} />
  }

  const record = student.data
  // The detail response embeds enrollments; the dedicated list is the fallback.
  const rows = enrollments.data ?? record.enrollments ?? []

  const columns: readonly Column<Enrollment>[] = [
    { key: 'year', header: text.enrollments.year, cell: (row) => labelFor(years, row.academic_year_id) },
    { key: 'grade', header: text.enrollments.grade, cell: (row) => labelFor(grades, row.grade_id) },
    {
      key: 'classroom',
      header: text.enrollments.classroom,
      cell: (row) => labelFor(classrooms, row.classroom_id),
    },
    {
      key: 'enrolled',
      header: text.enrollments.enrolledOn,
      numeric: true,
      cell: (row) => (row.enrolled_on ? formatDate(row.enrolled_on, locale) : shell.common.none),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={fullName(record)}
        meta={
          <span className="font-mono text-small text-muted" dir="ltr">
            {record.student_code}
          </span>
        }
        actions={
          <Button onClick={() => setEditing(true)}>
            <Icon name="pencil" />
            {shell.common.edit}
          </Button>
        }
      />

      <Card>
        <CardHeader title={text.detail} />
        <CardBody>
          {/* No grade or classroom field here: that is enrollment history. */}
          <DefinitionList
            columns={3}
            items={[
              { term: text.fields.nationalId, value: record.national_id ?? shell.common.none, mono: true },
              { term: text.fields.gender, value: text.genders[record.gender] },
              {
                term: text.fields.birthDate,
                value: record.birth_date ? formatDate(record.birth_date, locale) : shell.common.none,
              },
              { term: text.fields.guardianName, value: record.guardian_name ?? shell.common.none },
              {
                term: text.fields.guardianPhone,
                value: record.guardian_phone ?? shell.common.none,
                mono: true,
              },
            ]}
          />
        </CardBody>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-h1 font-semibold text-ink">{text.enrollments.title}</h2>
            <p className="text-small text-muted">{text.enrollments.description}</p>
          </div>
          <Button variant="primary" onClick={() => setEnrolling(true)}>
            <Icon name="plus" />
            {text.enrollments.enroll}
          </Button>
        </div>

        <DataTable
          caption={text.enrollments.title}
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          isLoading={enrollments.isLoading}
          empty={
            <EmptyState
              title={text.enrollments.empty}
              description={text.enrollments.emptyBody}
              action={
                <Button variant="primary" onClick={() => setEnrolling(true)}>
                  {text.enrollments.enroll}
                </Button>
              }
            />
          }
        />
      </div>

      <StudentDrawer open={editing} student={record} onClose={() => setEditing(false)} />
      <EnrollDrawer studentId={id} open={enrolling} onClose={() => setEnrolling(false)} />
    </div>
  )
}
