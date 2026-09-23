import { useState } from 'react'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Field } from '~/ui/field'
import { Icon } from '~/ui/icon'
import { Modal } from '~/ui/modal'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { SearchInput } from '~/ui/search-input'
import { Select } from '~/ui/select'
import { Spinner } from '~/ui/spinner'
import { useStudentList, useStudentTermResults } from '../../api/students'
import type { Student, StudentTermSubject } from '../../api/types'
import { useClassroomOptions, useCurriculumNames } from '../../api/use-options'
import { GradeField, TermField } from '../../components/term-grade-fields'
import { schoolText } from '../../school.i18n'
import { ReportCardTable } from '../students/report-card-table'
import { fullName } from '../students/student-name'
import { ResultEntryDrawer, type ResultEditContext } from './result-entry-drawer'
import { resultsText } from './results.i18n'

const PER_PAGE = 20
const DEFAULTS = { term: '', grade: '', classroom: '', search: '' } as const

/**
 * Browsing results here means finding a student and reading their whole
 * report card, not scanning a flat list of individual subject rows — so
 * the primary list is students (searchable by name/code, filterable by
 * grade/classroom), and picking one renders their term's full subject
 * table (ReportCardTable, the same one the student profile page uses)
 * right underneath, without leaving the page.
 */
export function ResultsListScreen() {
  const text = useDict(resultsText)
  const shell = useDict(schoolText)
  const { values, page, setValue, setValues, setPage } = useTableParams(DEFAULTS)
  const [entering, setEntering] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editingSubject, setEditingSubject] = useState<StudentTermSubject | null>(null)
  const { termName } = useCurriculumNames()

  const search = useDebouncedValue(values.search)
  const classrooms = useClassroomOptions({ gradeId: values.grade || undefined })

  const list = useStudentList({
    page,
    perPage: PER_PAGE,
    search,
    gradeId: values.grade || undefined,
    classroomId: values.classroom || undefined,
  })

  const report = useStudentTermResults(selectedStudent?.id ?? '', values.term)

  // Narrowing the grade invalidates whatever classroom was picked. Both
  // must go through one setValues() call — two separate setValue() calls
  // in the same tick race each other in react-router's setSearchParams and
  // only the last one's change actually lands (see useTableParams).
  const changeGrade = (value: string) => setValues({ grade: value, classroom: '' })

  const enrollmentId = selectedStudent?.current_enrollment?.id
  const editContext: ResultEditContext | undefined =
    editingSubject && selectedStudent && enrollmentId
      ? {
          studentEnrollmentId: enrollmentId,
          studentName: fullName(selectedStudent),
          subjectId: editingSubject.subject_id,
          subjectName: editingSubject.subject_name,
          examPeriodId: values.term,
          termName: termName(values.term),
          gradingType: editingSubject.grading_type,
          score: editingSubject.score,
          maxScore: editingSubject.max_score,
          qualitativeRating: editingSubject.qualitative_rating,
          isAbsent: editingSubject.is_absent,
        }
      : undefined

  const columns: readonly Column<Student>[] = [
    { key: 'name', header: text.columns.student, cell: (row) => fullName(row) },
    {
      key: 'code',
      header: text.columns.code,
      cell: (row) => <span className="font-mono">{row.student_code}</span>,
    },
    {
      key: 'classroom',
      header: text.filters.classroom,
      cell: (row) => row.current_enrollment?.classroom?.name ?? shell.common.none,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <Button variant="primary" onClick={() => setEntering(true)}>
            <Icon name="plus" />
            {text.newResult}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TermField value={values.term} onChange={(value) => setValue('term', value)} required />
        <GradeField value={values.grade} onChange={changeGrade} placeholder={shell.pickers.allGrades} />
        <Field label={text.filters.classroom}>
          {(props) => (
            <Select
              {...props}
              value={values.classroom}
              onChange={(event) => setValue('classroom', event.target.value)}
              options={classrooms}
              placeholder={text.filters.anyClassroom}
            />
          )}
        </Field>
      </div>

      <SearchInput
        label={text.searchLabel}
        value={values.search}
        onChange={(event) => setValue('search', event.target.value)}
      />

      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} labels={shell.error} />
      ) : (
        <>
          <DataTable
            caption={text.title}
            columns={columns}
            rows={list.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowActivate={setSelectedStudent}
            isLoading={list.isLoading}
            empty={<EmptyState title={text.noStudentsTitle} description={text.noStudentsBody} />}
          />

          {list.data ? (
            <Pagination
              meta={list.data.meta}
              onPageChange={setPage}
              labels={{
                previous: shell.common.previous,
                next: shell.common.next,
                summary: (meta) => shell.common.pageSummary(meta.current_page, meta.last_page, meta.total),
              }}
            />
          ) : null}
        </>
      )}

      <Modal
        open={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent ? fullName(selectedStudent) : ''}
        description={text.reportCardTitle}
        closeLabel={shell.common.close}
      >
        {values.term === '' ? (
          <p className="text-small text-muted">{text.pickTermPrompt}</p>
        ) : report.isError ? (
          <ErrorState error={report.error} onRetry={() => void report.refetch()} labels={shell.error} />
        ) : report.isPending ? (
          <div className="flex items-center gap-3 text-muted">
            <Spinner className="text-accent" label={shell.guard.loading} />
            <p className="text-small">{shell.guard.loading}</p>
          </div>
        ) : (
          <ReportCardTable
            subjects={report.data.subjects}
            onEditSubject={enrollmentId ? setEditingSubject : undefined}
          />
        )}
      </Modal>

      <ResultEntryDrawer open={entering} onClose={() => setEntering(false)} />
      <ResultEntryDrawer
        open={editingSubject !== null}
        onClose={() => setEditingSubject(null)}
        editContext={editContext}
      />
    </div>
  )
}
