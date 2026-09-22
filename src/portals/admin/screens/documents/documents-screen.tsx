import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useDict } from '~/lib/i18n/use-dict'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { SearchInput } from '~/ui/search-input'
import { Spinner } from '~/ui/spinner'
import { adminText } from '../../admin.i18n'
import { useSchoolStudents } from '../../api/insights'
import { useTenantList } from '../../api/tenants'
import type { SchoolStudentRow, TenantSummary } from '../../api/types'
import { documentsText } from './documents.i18n'

const PER_PAGE = 8

export function DocumentsScreen() {
  const text = useDict(documentsText)
  const shell = useDict(adminText)
  const navigate = useNavigate()

  const [school, setSchool] = useState<TenantSummary | null>(null)
  const [schoolSearch, setSchoolSearch] = useState('')
  const [student, setStudent] = useState<SchoolStudentRow | null>(null)
  const [studentSearch, setStudentSearch] = useState('')

  const schoolQuery = useDebouncedValue(schoolSearch)
  const studentQuery = useDebouncedValue(studentSearch)

  const schools = useTenantList(
    { page: 1, perPage: PER_PAGE, search: schoolQuery, status: '', provisioningStatus: '' },
    school === null,
  )
  const students = useSchoolStudents(
    school?.code ?? '',
    { page: 1, perPage: PER_PAGE, search: studentQuery, gradeId: '', classroomId: '' },
    school !== null && student === null,
  )

  const pickSchool = (row: TenantSummary) => {
    setSchool(row)
    setStudent(null)
    setStudentSearch('')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      <Card>
        <CardHeader
          title={text.stepSchool}
          action={
            school ? (
              <button
                type="button"
                className="text-small text-accent underline-offset-2 hover:underline"
                onClick={() => {
                  setSchool(null)
                  setStudent(null)
                }}
              >
                {text.changeSchool}
              </button>
            ) : undefined
          }
        />
        <CardBody className="flex flex-col gap-4">
          {school ? (
            <div className="flex items-center gap-3">
              <Icon name="school" className="text-accent" />
              <div className="flex flex-col">
                <span className="font-semibold text-ink">{school.name}</span>
                <span className="font-mono text-small text-muted" dir="ltr">
                  {school.code}
                </span>
              </div>
            </div>
          ) : (
            <>
              <SearchInput label={text.schoolSearch} value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)} />

              {schools.isError ? (
                <ErrorState error={schools.error} onRetry={() => void schools.refetch()} labels={shell.error} />
              ) : schools.isPending ? (
                <Spinner className="text-accent" label={shell.guard.loading} />
              ) : schools.data.data.length === 0 ? (
                <EmptyState title={text.noSchoolsTitle} description={text.noSchoolsBody} />
              ) : (
                <ul className="flex flex-col divide-y divide-line rounded-control border border-line">
                  {schools.data.data.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors duration-150 ease-out hover:bg-sunken"
                        onClick={() => pickSchool(row)}
                      >
                        <span className="font-medium text-ink">{row.name}</span>
                        <span className="font-mono text-small text-muted" dir="ltr">
                          {row.code}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {school ? (
        <Card>
          <CardHeader
            title={text.stepStudent}
            action={
              student ? (
                <button
                  type="button"
                  className="text-small text-accent underline-offset-2 hover:underline"
                  onClick={() => setStudent(null)}
                >
                  {text.changeStudent}
                </button>
              ) : undefined
            }
          />
          <CardBody className="flex flex-col gap-4">
            {student ? (
              <div className="flex items-center gap-3">
                <Icon name="user" className="text-accent" />
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">{student.name}</span>
                  <span className="font-mono text-small text-muted" dir="ltr">
                    {student.student_code}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <SearchInput
                  label={text.studentSearch}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />

                {students.isError ? (
                  <ErrorState error={students.error} onRetry={() => void students.refetch()} labels={shell.error} />
                ) : students.isPending ? (
                  <Spinner className="text-accent" label={shell.guard.loading} />
                ) : students.data.data.length === 0 ? (
                  <EmptyState title={text.noStudentsTitle} description={text.noStudentsBody} />
                ) : (
                  <ul className="flex flex-col divide-y divide-line rounded-control border border-line">
                    {students.data.data.map((row) => (
                      <li key={row.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors duration-150 ease-out hover:bg-sunken"
                          onClick={() => setStudent(row)}
                        >
                          <span className="font-medium text-ink">{row.name}</span>
                          <span className="font-mono text-small text-muted" dir="ltr">
                            {row.student_code}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </CardBody>
        </Card>
      ) : null}

      {school && student ? (
        <Card>
          <CardHeader title={text.actions.title} />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                className="flex flex-col gap-1 rounded-card border border-line bg-surface p-5 text-start transition-colors duration-150 ease-out hover:bg-sunken"
                onClick={() => navigate(`/admin/schools/${school.code}/students/${student.id}/print`)}
              >
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Icon name="sheet" className="text-accent" />
                  {text.actions.resultExtract}
                </span>
                <span className="text-small text-muted">{text.actions.resultExtractHint}</span>
              </button>

              <button
                type="button"
                className="flex flex-col gap-1 rounded-card border border-line bg-surface p-5 text-start transition-colors duration-150 ease-out hover:bg-sunken"
                onClick={() => navigate(`/admin/schools/${school.code}/students/${student.id}/enrollment-statement`)}
              >
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Icon name="ledger" className="text-accent" />
                  {text.actions.enrollmentStatement}
                </span>
                <span className="text-small text-muted">{text.actions.enrollmentStatementHint}</span>
              </button>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
