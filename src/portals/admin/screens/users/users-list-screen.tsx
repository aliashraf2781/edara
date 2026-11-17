import { useState } from 'react'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { FilterChip } from '~/ui/chip'
import { DataTable, type Column } from '~/ui/data-table'
import { ConfirmDialog } from '~/ui/dialog'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Pagination } from '~/ui/pagination'
import { SearchInput } from '~/ui/search-input'
import { Select } from '~/ui/select'
import { Stamp, type StampTone } from '~/ui/stamp'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import type { GlobalUser, UserStatus } from '../../api/types'
import {
  USER_SORTS,
  USER_STATUSES,
  useDeleteGlobalUser,
  useGlobalRoles,
  useGlobalUserList,
} from '../../api/users'
import { useAdminSession } from '../../auth/session-context'
import { CreateUserDrawer } from './create-user-drawer'
import { EditUserDrawer } from './edit-user-drawer'
import { StatusDialog } from './status-dialog'
import { globalUsersText } from './users.i18n'

const PER_PAGE = 10
const DEFAULT_SORT = '-created_at'
const DEFAULTS = { search: '', status: '', role: '', sort: DEFAULT_SORT } as const

const STATUS_TONE: Record<UserStatus, StampTone> = {
  active: 'success',
  pending: 'attention',
  suspended: 'danger',
  rejected: 'danger',
  banned: 'danger',
}

const isStatus = (value: string): value is UserStatus =>
  (USER_STATUSES as readonly string[]).includes(value)

export function GlobalUsersScreen() {
  const text = useDict(globalUsersText)
  const shell = useDict(adminText)
  const { can, user: me } = useAdminSession()
  const { notify, notifyError } = useToast()

  const { values, page, setValue, setPage, clear } = useTableParams(DEFAULTS)
  const search = useDebouncedValue(values.search)
  const allowed = can(PERMISSION.viewGlobalUsers)

  // A hand-edited URL with an unknown status would 422; ignore it instead.
  const status = isStatus(values.status) ? values.status : ''

  const list = useGlobalUserList(
    { page, perPage: PER_PAGE, search, status, role: values.role, email: '', sort: values.sort },
    allowed,
  )
  const roles = useGlobalRoles(allowed)
  const deleteUser = useDeleteGlobalUser()

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<GlobalUser | null>(null)
  const [statusFor, setStatusFor] = useState<GlobalUser | null>(null)
  const [removing, setRemoving] = useState<GlobalUser | null>(null)

  if (!allowed) return <NoAccess title={text.title} description={shell.guard.noAccess} />

  const canCreate = can(PERMISSION.createGlobalUser)
  const canUpdate = can(PERMISSION.updateGlobalUser)
  const canDelete = can(PERMISSION.deleteGlobalUser)

  const isFiltered =
    values.search !== '' || status !== '' || values.role !== ''

  const confirmDelete = async () => {
    if (!removing) return
    const wasOnlyRowOnPage = (list.data?.data.length ?? 0) === 1
    try {
      await deleteUser.mutateAsync(removing.id)
      notify('success', text.deleted)
      setRemoving(null)
      // Removing the last row of the last page would strand the user on an empty page.
      if (wasOnlyRowOnPage && page > 1) setPage(page - 1)
    } catch (error) {
      notifyError(error, shell.error.title)
      setRemoving(null)
    }
  }

  const columns: readonly Column<GlobalUser>[] = [
    {
      key: 'name',
      header: text.columns.name,
      cell: (row) => (
        <span className="flex flex-wrap items-center gap-2">
          {row.name}
          {row.id === me.id ? <Stamp tone="info">{text.you}</Stamp> : null}
        </span>
      ),
    },
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
        <Stamp tone={STATUS_TONE[row.status] ?? 'neutral'}>
          {text.statuses[row.status] ?? row.status}
        </Stamp>
      ),
    },
    {
      key: 'actions',
      header: text.columns.actions,
      // Controls are hidden, not disabled, so nobody clicks into a 403. You
      // cannot suspend or delete yourself from here: the server may refuse it,
      // and locking out your own session is never what was meant.
      cell: (row) => {
        const isSelf = row.id === me.id
        return (
          <div className="flex items-center justify-end gap-1">
            {canUpdate ? (
              <Button variant="ghost" onClick={() => setEditing(row)}>
                <Icon name="pencil" className="size-4" />
                {text.edit}
              </Button>
            ) : null}
            {canUpdate && !isSelf ? (
              <Button variant="ghost" onClick={() => setStatusFor(row)}>
                {text.changeStatus}
              </Button>
            ) : null}
            {canDelete && !isSelf ? (
              <Button
                variant="ghost"
                destructive
                aria-label={`${text.delete}: ${row.name}`}
                onClick={() => setRemoving(row)}
              >
                <Icon name="trash" className="size-4" />
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]

  const roleOptions = (roles.data ?? []).map((role) => ({
    value: role.name,
    label: text.roleNames[role.name] ?? role.name,
  }))
  // A role in the URL that is no longer offered (deleted) must still be removable.
  const roleLabel =
    roleOptions.find((option) => option.value === values.role)?.label ?? values.role

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          canCreate ? (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Icon name="plus" />
              {text.newUser}
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          label={text.searchLabel}
          value={values.search}
          onChange={(event) => setValue('search', event.target.value)}
        />

        <Select
          aria-label={text.filters.status}
          value={status}
          onChange={(event) => setValue('status', event.target.value)}
          placeholder={text.filters.anyStatus}
          options={USER_STATUSES.map((value) => ({ value, label: text.statuses[value] }))}
        />

        <Select
          aria-label={text.filters.role}
          value={values.role}
          onChange={(event) => setValue('role', event.target.value)}
          placeholder={text.filters.anyRole}
          options={roleOptions}
        />

        <Select
          aria-label={text.filters.sort}
          value={values.sort}
          onChange={(event) => setValue('sort', event.target.value)}
          options={USER_SORTS.map((value) => ({ value, label: text.sorts[value] ?? value }))}
        />

        {status === '' ? null : (
          <FilterChip
            label={text.filters.status}
            value={text.statuses[status]}
            onRemove={() => setValue('status', '')}
            removeLabel={text.filters.remove}
          />
        )}
        {values.role === '' ? null : (
          <FilterChip
            label={text.filters.role}
            value={roleLabel}
            onRemove={() => setValue('role', '')}
            removeLabel={text.filters.remove}
          />
        )}
        {isFiltered || values.sort !== DEFAULT_SORT ? (
          <Button variant="ghost" onClick={clear}>
            {text.filters.clear}
          </Button>
        ) : null}
      </div>

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
                title={isFiltered ? text.noResultsTitle : text.emptyTitle}
                description={isFiltered ? text.noResultsBody : text.emptyBody}
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

      {canCreate ? <CreateUserDrawer open={creating} onClose={() => setCreating(false)} /> : null}
      {/* Keyed by user: picking a different row remounts with their values. */}
      {editing ? (
        <EditUserDrawer key={editing.id} user={editing} onClose={() => setEditing(null)} />
      ) : null}
      {statusFor ? (
        <StatusDialog key={statusFor.id} user={statusFor} onClose={() => setStatusFor(null)} />
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
