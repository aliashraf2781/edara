import { useDict } from '~/lib/i18n/use-dict'
import { EmptyState } from '~/ui/empty-state'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useAdminSession } from '../../auth/session-context'
import { auditText } from './audit.i18n'

/**
 * The endpoint is documented but not implemented yet, so this screen states
 * that plainly instead of calling an route that can only fail.
 */
export function AuditLogScreen() {
  const text = useDict(auditText)
  const shell = useDict(adminText)
  const { can } = useAdminSession()

  if (!can(PERMISSION.viewAuditLog)) {
    return <NoAccess title={text.title} description={shell.guard.noAccess} />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />
      <EmptyState title={text.pendingTitle} description={text.pendingBody} />
    </div>
  )
}
