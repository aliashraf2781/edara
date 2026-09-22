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
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import type { GlobalUser } from '../../api/types'
import { useDeleteGlobalUser, useGlobalUserList } from '../../api/users'
import { useAdminSession } from '../../auth/session-context'
import { CreateUserDrawer } from './create-user-drawer'
import { SyncRolesDrawer } from './sync-roles-drawer'
import { globalUsersText } from './users.i18n'

const PER_PAGE = 20
const DEFAULTS = { search: '' } as const

export function GlobalUsersScreen() {
  const text = useDict(globalUsersText)
  const shell = useDict(adminText)
  const { can, isGlobalAdmin, user: me } = useAdminSession()
  const { notify, notifyError } = useToast()

  const { values, page, setValue, setPage } = useTableParams(DEFAULTS)
  const search = useDebouncedValue(values.search)
  const allowed = can(PERMISSION.viewGlobalUsers)

  const list = useGlobalUserList({ page, perPage: PER_PAGE, search }, allowed)
  const deleteUser = useDeleteGlobalUser()

  const [creating, setCreating] = useState(false)
  const [syncing, setSyncing] = useState<GlobalUser | null>(null)
  const [removing, setRemoving] = useState<GlobalUser | null>(null)

  if (!allowed) return <NoAccess title={text.title} description={shell.guard.noAccess} />

  const confirmDelete = async () => {
    if (!removing) return
    try {
      await deleteUser.mutateAsync(removing.id)
      notify('success', text.deleted)
      setRemoving(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const columns: readonly Column<GlobalUser>[] = [
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
              {text.roleNames[role] ?? role}
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
      header: text.columns.actions,
      // Create and role-sync are global-admin only. They are hidden rather
      // than shown disabled, so nobody clicks into a 403.
      cell: (row) =>
        isGlobalAdmin ? (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" onClick={() => setSyncing(row)}>
              {text.syncRoles}
            </Button>
            {can(PERMISSION.deleteGlobalUser) && row.id !== me.id ? (
              <Button variant="ghost" destructive onClick={() => setRemoving(row)}>
                <Icon name="trash" className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          isGlobalAdmin && can(PERMISSION.createGlobalUser) ? (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Icon name="plus" />
              {text.newUser}
            </Button>
          ) : (
            <p className="text-small text-muted">{text.restricted}</p>
          )
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

      <CreateUserDrawer open={creating} onClose={() => setCreating(false)} />
      {/* Keyed by user: picking a different row remounts with their roles. */}
      {syncing ? (
        <SyncRolesDrawer key={syncing.id} user={syncing} onClose={() => setSyncing(null)} />
      ) : null}

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleteUser.isPending}
        destructive
        title={text.deleteTitle}
        consequence={text.deleteConsequence}
        confirmLabel={text.delete}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
