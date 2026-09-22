import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { ConfirmDialog } from '~/ui/dialog'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { SearchInput } from '~/ui/search-input'
import { useToast } from '~/ui/toast'
import { useDeleteStudent, useStudentList } from '../../api/students'
import type { Student } from '../../api/types'
import { useSchoolSession } from '../../auth/session-context'
import { schoolText } from '../../school.i18n'
import { StudentDrawer } from './student-drawer'
import { fullName } from './student-name'
import { studentsText } from './students.i18n'

const PER_PAGE = 20
const DEFAULTS = { search: '' } as const

export function StudentsListScreen() {
  const text = useDict(studentsText)
  const shell = useDict(schoolText)
  const navigate = useNavigate()
  const { can } = useSchoolSession()
  const { notify, notifyError } = useToast()

  const { values, page, setValue, setPage } = useTableParams(DEFAULTS)
  const search = useDebouncedValue(values.search)
  const list = useStudentList({ page, perPage: PER_PAGE, search })
  const deleteStudent = useDeleteStudent()

  const [editing, setEditing] = useState<{ student: Student | null } | null>(null)
  const [removing, setRemoving] = useState<Student | null>(null)

  const confirmDelete = async () => {
    if (!removing) return
    try {
      await deleteStudent.mutateAsync(removing.id)
      notify('success', text.deleted)
      setRemoving(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const columns: readonly Column<Student>[] = [
    {
      key: 'code',
      header: text.columns.code,
      cell: (row) => <span className="font-mono">{row.student_code}</span>,
    },
    { key: 'name', header: text.columns.name, cell: (row) => fullName(row) },
    {
      key: 'national',
      header: text.columns.nationalId,
      numeric: true,
      cell: (row) => row.national_id ?? shell.common.none,
    },
    { key: 'gender', header: text.columns.gender, cell: (row) => text.genders[row.gender] },
    {
      key: 'guardian',
      header: text.columns.guardian,
      cell: (row) => (
        <span className="flex flex-col">
          <span>{row.guardian_name ?? shell.common.none}</span>
          {row.guardian_phone ? (
            <span className="font-mono text-small text-muted" dir="ltr">
              {row.guardian_phone}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'actions',
      header: shell.common.edit,
      headClassName: 'sr-only',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" onClick={() => setEditing({ student: row })}>
            <Icon name="pencil" className="size-4" />
            {shell.common.edit}
          </Button>
          {/* Deleting a student is admin-only. */}
          {can.canDeleteStudent ? (
            <Button variant="ghost" destructive onClick={() => setRemoving(row)}>
              <Icon name="trash" className="size-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <Button variant="primary" onClick={() => setEditing({ student: null })}>
            <Icon name="plus" />
            {text.newStudent}
          </Button>
        }
      />

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
            onRowActivate={(row) => navigate(`/school/students/${row.id}`)}
            isLoading={list.isLoading}
            tall
            empty={
              <EmptyState
                title={values.search === '' ? text.emptyTitle : text.noResultsTitle}
                description={values.search === '' ? text.emptyBody : text.noResultsBody}
                action={
                  values.search === '' ? (
                    <Button variant="primary" onClick={() => setEditing({ student: null })}>
                      {text.newStudent}
                    </Button>
                  ) : null
                }
              />
            }
          />

          {list.data ? (
            <Pagination
              meta={list.data.meta}
              onPageChange={setPage}
              labels={{
                previous: shell.common.previous,
                next: shell.common.next,
                summary: (meta) =>
                  shell.common.pageSummary(meta.current_page, meta.last_page, meta.total),
              }}
            />
          ) : null}
        </>
      )}

      <StudentDrawer
        open={editing !== null}
        student={editing?.student ?? null}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleteStudent.isPending}
        destructive
        title={text.deleteTitle}
        consequence={removing ? text.deleteConsequence(fullName(removing)) : ''}
        confirmLabel={shell.common.delete}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
