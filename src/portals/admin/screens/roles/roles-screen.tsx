import { useDict } from '~/lib/i18n/use-dict'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { ErrorState } from '~/ui/error-state'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Spinner } from '~/ui/spinner'
import { Stamp } from '~/ui/stamp'
import { adminText } from '../../admin.i18n'
import { PERMISSION } from '../../api/permissions'
import { useGlobalRoles } from '../../api/users'
import { useAdminSession } from '../../auth/session-context'
import { rolesText } from './roles.i18n'
import { globalUsersText } from '../users/users.i18n'

/** Read-only. Writing roles is a global-admin action and lives on a user, not here. */
export function RolesScreen() {
  const text = useDict(rolesText)
  const userText = useDict(globalUsersText)
  const shell = useDict(adminText)
  const { can } = useAdminSession()

  const allowed = can(PERMISSION.viewGlobalUsers)
  const roles = useGlobalRoles(allowed)

  if (!allowed) return <NoAccess title={text.title} description={shell.guard.noAccess} />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={text.title} description={text.description} />

      {roles.isPending ? (
        <div className="flex items-center gap-3 text-muted">
          <Spinner className="text-accent" label={shell.guard.loading} />
          <p className="text-small">{shell.guard.loading}</p>
        </div>
      ) : roles.isError ? (
        <ErrorState error={roles.error} onRetry={() => void roles.refetch()} labels={shell.error} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {roles.data.map((role) => (
            <Card key={role.id}>
              <CardHeader title={userText.roleNames[role.name] ?? role.name} />
              <CardBody className="flex flex-col gap-4">
                <p className="font-mono text-small text-muted" dir="ltr">
                  {role.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.length === 0 ? (
                    <p className="text-small text-muted">{text.noPermissions}</p>
                  ) : (
                    role.permissions.map((permission) => (
                      <Stamp key={permission} tone="neutral">
                        {permission}
                      </Stamp>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
