import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { ConfirmDialog } from '~/ui/dialog'
import { NoAccess } from '~/ui/no-access'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useDeleteTenant, useTenantStatusChange } from '../../api/tenants'
import type { Tenant } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { schoolFormText } from './school-detail.i18n'
import { schoolsText } from './schools.i18n'

type PendingAction = 'deactivate' | 'activate' | 'delete'

export function DangerTab({ tenant }: { tenant: Tenant }) {
  const text = useDict(schoolFormText)
  const labels = useDict(schoolsText)
  const shell = useDict(adminText)
  const navigate = useNavigate()
  const { can, isGlobalAdmin } = useAdminSession()
  const { notify, notifyError } = useToast()

  const statusChange = useTenantStatusChange(tenant.code)
  const deleteTenant = useDeleteTenant()
  const [pending, setPending] = useState<PendingAction | null>(null)

  const canChangeStatus = can(PERMISSION.changeTenantStatus)
  // Deleting is gated on the role itself, not on a permission.
  const canDelete = isGlobalAdmin

  if (!canChangeStatus && !canDelete) {
    return <NoAccess title={text.danger.title} description={shell.guard.noAccess} />
  }

  const isActive = tenant.status === 'active'

  const run = async () => {
    try {
      if (pending === 'delete') {
        await deleteTenant.mutateAsync(tenant.code)
        notify('success', text.danger.deleted)
        navigate('/admin/schools', { replace: true })
        return
      }
      if (pending === null) return
      await statusChange.mutateAsync(pending)
      notify('success', labels.statusChanged)
      setPending(null)
    } catch (error) {
      notifyError(error, shell.error.title)
    }
  }

  const copy =
    pending === 'delete'
      ? {
          title: text.danger.deleteTitle,
          consequence: text.danger.deleteConsequence,
          confirm: text.danger.deleteAction,
        }
      : pending === 'deactivate'
        ? {
            title: labels.deactivateTitle,
            consequence: labels.deactivateConsequence,
            confirm: labels.deactivate,
          }
        : {
            title: labels.activateTitle,
            consequence: labels.activateConsequence,
            confirm: labels.activate,
          }

  return (
    <div className="flex flex-col gap-6">
      {canChangeStatus ? (
        <Card className="border-danger">
          <CardHeader title={isActive ? labels.deactivateTitle : labels.activateTitle} />
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-prose text-small text-muted">
              {isActive ? labels.deactivateConsequence : labels.activateConsequence}
            </p>
            <Button
              variant="primary"
              destructive={isActive}
              onClick={() => setPending(isActive ? 'deactivate' : 'activate')}
            >
              {isActive ? labels.deactivate : labels.activate}
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {canDelete ? (
        <Card className="border-danger">
          <CardHeader title={text.danger.deleteTitle} />
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-prose text-small text-muted">{text.danger.deleteBody}</p>
            <Button variant="primary" destructive onClick={() => setPending('delete')}>
              {text.danger.deleteAction}
            </Button>
          </CardBody>
        </Card>
      ) : null}

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={run}
        loading={statusChange.isPending || deleteTenant.isPending}
        destructive={pending !== 'activate'}
        title={copy.title}
        consequence={copy.consequence}
        confirmLabel={copy.confirm}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
