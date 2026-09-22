import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Spinner } from '~/ui/spinner'
import { Tabs, type TabItem } from '~/ui/tabs'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useTenant } from '../../api/tenants'
import { useAdminSession } from '../../auth/session-context'
import { DangerTab } from './danger-tab'
import { OfficersTab } from './officers-tab'
import { OverviewTab } from './overview-tab'
import { ProvisionPanel } from './provision-panel'
import { resultsText } from '../results/results.i18n'
import { schoolFormText } from './school-detail.i18n'
import { schoolsText } from './schools.i18n'
import { ProvisioningStamp, TenantStatusStamp } from './tenant-stamps'

type TabId = 'overview' | 'officers' | 'danger'

export function SchoolDetailScreen() {
  const text = useDict(schoolFormText)
  const labels = useDict(schoolsText)
  const results = useDict(resultsText)
  const shell = useDict(adminText)
  const { can } = useAdminSession()
  const navigate = useNavigate()
  const code = useParams().code ?? ''
  const [tab, setTab] = useState<TabId>('overview')

  const allowed = can(PERMISSION.viewTenant) || can(PERMISSION.viewTenants)
  const tenant = useTenant(code, allowed)

  if (!allowed) return <NoAccess title={labels.title} description={shell.guard.noAccess} />

  if (tenant.isPending) {
    return (
      <div className="flex items-center gap-3 text-muted">
        <Spinner className="text-accent" label={shell.guard.loading} />
        <p className="text-small">{shell.guard.loading}</p>
      </div>
    )
  }

  if (tenant.isError) {
    return <ErrorState error={tenant.error} onRetry={() => void tenant.refetch()} labels={shell.error} />
  }

  const record = tenant.data
  const items: readonly TabItem<TabId>[] = [
    { id: 'overview', label: text.tabs.overview },
    { id: 'officers', label: text.tabs.officers },
    { id: 'danger', label: text.tabs.danger },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={record.name}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-small text-muted" dir="ltr">
              {record.code}
            </span>
            <TenantStatusStamp status={record.status} label={labels.status[record.status]} />
            <ProvisioningStamp
              status={record.provisioningStatus}
              label={labels.provisioning[record.provisioningStatus]}
            />
          </div>
        }
        actions={
          <>
            <Button onClick={() => navigate(`/admin/schools/${record.code}/results`)}>
              <Icon name="chart" />
              {results.tabs.results}
            </Button>
            <Button onClick={() => navigate(`/admin/schools/${record.code}/students`)}>
              <Icon name="users" />
              {results.tabs.students}
            </Button>
          </>
        }
      />

      <ProvisionPanel tenant={record} />

      <Tabs label={record.name} items={items} active={tab} onChange={setTab} />

      {tab === 'overview' ? <OverviewTab tenant={record} /> : null}
      {tab === 'officers' ? <OfficersTab tenant={record} /> : null}
      {tab === 'danger' ? <DangerTab tenant={record} /> : null}
    </div>
  )
}
