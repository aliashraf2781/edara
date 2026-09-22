import { useState } from 'react'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { DataTable, type Column } from '~/ui/data-table'
import { ConfirmDialog } from '~/ui/dialog'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { SearchInput } from '~/ui/search-input'
import { Stamp } from '~/ui/stamp'
import { useToast } from '~/ui/toast'
import type { SchoolRole } from '../../api/roles'
import { useDeleteStaff, useStaffList } from '../../api/staff'
import type { SchoolUser } from '../../api/types'
import { useSchoolSession } from '../../auth/session-context'
import { schoolText } from '../../school.i18n'
import { StaffDrawer } from './staff-drawer'
import { StaffRolesDrawer } from './staff-roles-drawer'
import { staffText } from './staff.i18n'

const PER_PAGE = 20
const DEFAULTS = { search: '' } as const

export function StaffScreen() {
  const text = useDict(staffText)
  const shell = useDict(schoolText)
  const { can, user: me } = useSchoolSession()
  const { notify, notifyError } = useToast()

  const { values, page, setValue, setPage } = useTableParams(DEFAULTS)
  const search = useDebouncedValue(values.search)
  const list = useStaffList({ page, perPage: PER_PAGE, search }, can.canManageStaff)
  const deleteStaff = useDeleteStaff()

  const [editing, setEditing] = useState<{ staff: SchoolUser | null } | null>(null)
  const [syncing, setSyncing] = useState<SchoolUser | null>(null)
  const [removing, setRemoving] = useState<SchoolUser | null>(null)

  if (!can.canManageStaff) {
    return <NoAccess title={text.title} description={shell.guard.noAccess} />
  }

  const confirmDelete = async () => {
    if (!removing) return
    try {
      await deleteStaff.mutateAsync(removing.id)
      notify('success', text.deleted)
      setRemoving(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const columns: readonly Column<SchoolUser>[] = [
    { key: 'name', header: text.columns.name, cell: (row) => row.name },
    {
      key: 'email',
      header: text.columns.email,
      cell: (row) => (
        <span className="font-mono" dir="ltr">
          {row.email}
        </span>
      ),
    },
    {
      key: 'roles',
      header: text.columns.roles,
      cell: (row) => (
        <span className="flex flex-wrap gap-1">
          {row.roles.map((role) => (
            <Stamp key={role} tone="neutral">
              {shell.roles[role as SchoolRole] ?? role}
            </Stamp>
          ))}
        </span>
      ),
    },
    {
      key: 'status',
      header: text.columns.status,
      cell: (row) => (
        <Stamp tone={row.status === 'active' ? 'success' : 'attention'}>
          {text.statuses[row.status]}
        </Stamp>
      ),
    },
    {
      key: 'actions',
      header: shell.common.edit,
      headClassName: 'sr-only',
      cell: (row) => {
        const isSelf = row.id === me.id
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" onClick={() => setEditing({ staff: row })}>
              <Icon name="pencil" className="size-4" />
              {shell.common.edit}
            </Button>
            <Button variant="ghost" onClick={() => setSyncing(row)}>
              {text.editRoles}
            </Button>
            {/* Deleting yourself returns a 422, so the button is disabled with
                the reason rather than letting the request fail. */}
            <Button
              variant="ghost"
              destructive
              disabled={isSelf}
              title={isSelf ? text.cannotDeleteSelf : undefined}
              onClick={() => setRemoving(row)}
            >
              <Icon name="trash" className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <Button variant="primary" onClick={() => setEditing({ staff: null })}>
            <Icon name="plus" />
            {text.newStaff}
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
            isLoading={list.isLoading}
            empty={
              <EmptyState
                title={values.search === '' ? text.emptyTitle : text.noResultsTitle}
                description={values.search === '' ? text.emptyBody : text.noResultsBody}
                action={
                  values.search === '' ? (
                    <Button variant="primary" onClick={() => setEditing({ staff: null })}>
                      {text.newStaff}
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

      <StaffDrawer
        open={editing !== null}
        staff={editing?.staff ?? null}
        onClose={() => setEditing(null)}
      />
      {/* Keyed by staff member, so switching rows resets the ticked roles. */}
      {syncing ? (
        <StaffRolesDrawer key={syncing.id} staff={syncing} onClose={() => setSyncing(null)} />
      ) : null}

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleteStaff.isPending}
        destructive
        title={text.deleteTitle}
        consequence={removing ? text.deleteConsequence(removing.name) : ''}
        confirmLabel={shell.common.delete}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
