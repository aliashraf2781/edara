import { isApiError } from '~/lib/api/error'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Dialog } from '~/ui/dialog'
import { Icon } from '~/ui/icon'
import { Spinner } from '~/ui/spinner'
import { useToast } from '~/ui/toast'
import { PERMISSION } from '../../api/permissions'
import { useProvisionTenant } from '../../api/tenants'
import type { Tenant } from '../../api/types'
import { useAdminSession } from '../../auth/session-context'
import { OneTimePasswordDialog } from './one-time-password-dialog'
import { schoolFormText } from './school-detail.i18n'

/**
 * Creation now provisions automatically, so this only ever shows up as a
 * manual-retry path when that automatic step failed. The call is synchronous
 * and can take seconds, and there is no polling endpoint, so it blocks behind
 * a modal spinner rather than pretending to be a background job.
 */
export function ProvisionPanel({ tenant }: { tenant: Tenant }) {
  const text = useDict(schoolFormText)
  const { can } = useAdminSession()
  const { notify } = useToast()
  const provision = useProvisionTenant(tenant.code)

  const needsProvisioning =
    tenant.provisioningStatus === 'pending' || tenant.provisioningStatus === 'failed'

  if (!needsProvisioning || !can(PERMISSION.provisionTenant)) return null

  const failed = tenant.provisioningStatus === 'failed'
  const password = provision.data?.superAdmin.temporaryPassword ?? null

  const run = async () => {
    const result = await provision.mutateAsync().catch(() => null)
    // A repeat call succeeds with a null password. That is not an error —
    // it means no new credentials were generated (guide 3.1).
    if (result && result.superAdmin.temporaryPassword === null) {
      notify('info', text.provision.alreadyProvisioned)
    }
  }

  return (
    <>
      <section
        className={`flex flex-wrap items-center justify-between gap-4 rounded-card border border-s-2 p-6 ${
          failed ? 'border-danger bg-danger/12' : 'border-attention bg-attention/12'
        }`}
      >
        <div className="flex flex-col gap-1">
          <p className={`flex items-center gap-2 text-h2 font-semibold ${failed ? 'text-danger' : 'text-attention'}`}>
            <Icon name={failed ? 'alert' : 'info'} />
            {failed ? text.provision.retryTitle : text.provision.bannerTitle}
          </p>
          <p className="text-small text-muted">
            {failed ? text.provision.retryBody : text.provision.bannerBody}
          </p>
          {provision.isError && isApiError(provision.error) ? (
            <p role="alert" className="text-small text-danger">
              {provision.error.message}
            </p>
          ) : null}
        </div>

        <Button variant="primary" onClick={run} loading={provision.isPending}>
          {text.provision.action}
        </Button>
      </section>

      <Dialog
        open={provision.isPending}
        busy
        onClose={() => undefined}
        title={text.provision.running}
        footer={null}
      >
        <p className="flex items-center gap-3">
          <Spinner className="text-accent" label={text.provision.running} />
          {text.provision.runningBody}
        </p>
      </Dialog>

      {password === null ? null : (
        <OneTimePasswordDialog
          open
          email={provision.data?.superAdmin.email ?? ''}
          password={password}
          // Resetting drops the password from the mutation's own state, so it
          // does not survive in memory after the dialog closes.
          onAcknowledge={() => provision.reset()}
        />
      )}
    </>
  )
}
