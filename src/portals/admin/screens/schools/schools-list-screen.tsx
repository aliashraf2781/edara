import { useState } from 'react'
import { useNavigate } from 'react-router'
import { formatDate } from '~/lib/format'
import { useDebouncedValue } from '~/lib/hooks/use-debounced-value'
import { useTableParams } from '~/lib/hooks/use-table-params'
import { useLocale } from '~/lib/i18n/locale-context'
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
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useTenantList, useTenantStatusChange } from '../../api/tenants'
import type { TenantSummary } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { schoolsText } from './schools.i18n'
import { SchoolsToolbar } from './schools-toolbar'
import { ProvisioningStamp, TenantStatusStamp } from './tenant-stamps'

const PER_PAGE = 20
const DEFAULTS = { search: '', status: '', provisioning: '' } as const

type PendingChange = { code: string; action: 'activate' | 'deactivate' }

export function SchoolsListScreen() {
  const text = useDict(schoolsText)
  const shell = useDict(adminText)
  const { locale } = useLocale()
  const { can } = useAdminSession()
  const navigate = useNavigate()
  const { notify, notifyError } = useToast()

  const { values, page, setValue, setPage, clear } = useTableParams(DEFAULTS)
  const search = useDebouncedValue(values.search)
  const allowed = can(PERMISSION.viewTenants)

  const list = useTenantList(
    {
      page,
      perPage: PER_PAGE,
      search,
      status: values.status,
      provisioningStatus: values.provisioning,
    },
    allowed,
  )

  const [pending, setPending] = useState<PendingChange | null>(null)
  const statusChange = useTenantStatusChange(pending?.code ?? '')

  if (!allowed) {
    return <NoAccess title={shell.nav.schools} description={shell.guard.noAccess} />
  }

  const confirmStatusChange = async () => {
    if (!pending) return
    try {
      await statusChange.mutateAsync(pending.action)
      notify('success', text.statusChanged)
      setPending(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const deactivating = pending?.action === 'deactivate'
  const hasFilters = values.search !== '' || values.status !== '' || values.provisioning !== ''
  const openDetail = (row: TenantSummary) => navigate(`/admin/schools/${row.code}`)

  const columns: readonly Column<TenantSummary>[] = [
    {
      key: 'code',
      header: text.columns.code,
      cell: (row) => <span className="font-mono">{row.code}</span>,
    },
    {
      key: 'name',
      header: text.columns.name,
      cell: (row) => row.name,
    },
    {
      key: 'status',
      header: text.columns.status,
      cell: (row) => <TenantStatusStamp status={row.status} label={text.status[row.status]} />,
    },
    {
      key: 'provisioning',
      header: text.columns.provisioning,
      cell: (row) => (
        <ProvisioningStamp
          status={row.provisioningStatus}
          label={text.provisioning[row.provisioningStatus]}
        />
      ),
    },
    {
      key: 'created',
      header: text.columns.created,
      numeric: true,
      cell: (row) => formatDate(row.createdAt, locale),
    },
    {
      key: 'actions',
      header: text.columns.actions,
      // The row itself opens the detail page, so actions stop the bubble.
      cell: (row) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          {can(PERMISSION.changeTenantStatus) ? (
            <Button
              variant="ghost"
              onClick={() =>
                setPending({
                  code: row.code,
                  action: row.status === 'active' ? 'deactivate' : 'activate',
                })
              }
            >
              {row.status === 'active' ? text.deactivate : text.activate}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => openDetail(row)}>
            {text.view}
          </Button>
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
          can(PERMISSION.createTenant) ? (
            <Button variant="primary" onClick={() => navigate('/admin/schools/new')}>
              <Icon name="plus" />
              {text.newSchool}
            </Button>
          ) : null
        }
      />

      <SchoolsToolbar
        search={values.search}
        status={values.status}
        provisioning={values.provisioning}
        onChange={setValue}
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
            onRowActivate={openDetail}
            isLoading={list.isLoading}
            tall
            empty={
              <EmptyState
                title={hasFilters ? text.noResultsTitle : text.emptyTitle}
                description={hasFilters ? text.noResultsBody : text.emptyBody}
                action={
                  hasFilters ? (
                    <Button onClick={clear}>{text.clearFilters}</Button>
                  ) : can(PERMISSION.createTenant) ? (
                    <Button variant="primary" onClick={() => navigate('/admin/schools/new')}>
                      {text.newSchool}
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

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirmStatusChange}
        loading={statusChange.isPending}
        destructive={deactivating}
        title={deactivating ? text.deactivateTitle : text.activateTitle}
        consequence={deactivating ? text.deactivateConsequence : text.activateConsequence}
        confirmLabel={deactivating ? text.deactivate : text.activate}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
