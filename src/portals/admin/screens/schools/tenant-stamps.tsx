import { Stamp, type StampTone } from '~/ui/stamp'
import type { ProvisioningStatus, TenantStatus } from '../../api/types'

const STATUS_TONE: Record<TenantStatus, StampTone> = {
  pending: 'neutral',
  active: 'success',
  disabled: 'danger',
  archived: 'neutral',
}

const PROVISIONING_TONE: Record<ProvisioningStatus, StampTone> = {
  pending: 'neutral',
  provisioning: 'info',
  provisioned: 'sealed',
  failed: 'danger',
}

export function TenantStatusStamp({ status, label }: { status: TenantStatus; label: string }) {
  return <Stamp tone={STATUS_TONE[status]}>{label}</Stamp>
}

export function ProvisioningStamp({
  status,
  label,
}: {
  status: ProvisioningStatus
  label: string
}) {
  return <Stamp tone={PROVISIONING_TONE[status]}>{label}</Stamp>
}
