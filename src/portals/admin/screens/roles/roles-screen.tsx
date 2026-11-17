import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Card, CardBody, CardHeader } from '~/ui/card'
import { ConfirmDialog } from '~/ui/dialog'
import { EmptyState } from '~/ui/empty-state'
import { ErrorState } from '~/ui/error-state'
import { Icon } from '~/ui/icon'
import { NoAccess } from '~/ui/no-access'
import { PageHeader } from '~/ui/page-header'
import { Spinner } from '~/ui/spinner'
import { Stamp } from '~/ui/stamp'
import { useToast } from '~/ui/toast'
import { adminText } from '../../admin.i18n'
import { PERMISSION, isBuiltInRole } from '../../api/permissions'
import type { Role } from '../../api/types'
import { useDeleteRole, useGlobalRoles } from '../../api/users'
import { useAdminSession } from '../../auth/session-context'
import { globalUsersText } from '../users/users.i18n'
import { RoleDrawer } from './role-drawer'
import { rolesText } from './roles.i18n'

/**
 * Viewing needs `view-global-users`. Writing is role-gated (global-admin or
 * super-admin) and never offered on the built-in roles: the backend would let
 * it through, and one slip there can lock every operator out.
 */
export function RolesScreen() {
  const text = useDict(rolesText)
  const userText = useDict(globalUsersText)
  const shell = useDict(adminText)
  const { can, isGlobalAdmin } = useAdminSession()
  const { notify, notifyError } = useToast()

  const allowed = can(PERMISSION.viewGlobalUsers)
  const roles = useGlobalRoles(allowed)
  const deleteRole = useDeleteRole()

  // `false` closed, `null` creating, a Role editing.
  const [editing, setEditing] = useState<Role | null | false>(false)
  const [removing, setRemoving] = useState<Role | null>(null)

  if (!allowed) return <NoAccess title={text.title} description={shell.guard.noAccess} />

  const confirmDelete = async () => {
    if (!removing) return
    try {
      await deleteRole.mutateAsync(removing.id)
      notify('success', text.deleted)
    } catch (error) {
      notifyError(error, shell.error.title)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={text.title}
        description={isGlobalAdmin ? text.description : `${text.description} ${text.readOnlyNote}`}
        actions={
          isGlobalAdmin ? (
            <Button variant="primary" onClick={() => setEditing(null)} disabled={!roles.data}>
              <Icon name="plus" />
              {text.newRole}
            </Button>
          ) : null
        }
      />

      {roles.isPending ? (
        <div className="flex items-center gap-3 text-muted">
          <Spinner className="text-accent" label={shell.guard.loading} />
          <p className="text-small">{shell.guard.loading}</p>
        </div>
      ) : roles.isError ? (
        <ErrorState error={roles.error} onRetry={() => void roles.refetch()} labels={shell.error} />
      ) : roles.data.length === 0 ? (
        <EmptyState title={text.emptyTitle} description={text.emptyBody} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {roles.data.map((role) => {
            const builtIn = isBuiltInRole(role.name)
            return (
              <Card key={role.id}>
                <CardHeader
                  title={userText.roleNames[role.name] ?? role.name}
                  action={
                    <div className="flex items-center gap-1">
                      {builtIn ? <Stamp tone="neutral">{text.builtIn}</Stamp> : null}
                      {isGlobalAdmin && !builtIn ? (
                        <>
                          <Button variant="ghost" onClick={() => setEditing(role)}>
                            <Icon name="pencil" className="size-4" />
                            {text.edit}
                          </Button>
                          <Button
                            variant="ghost"
                            destructive
                            aria-label={`${text.delete}: ${role.name}`}
                            onClick={() => setRemoving(role)}
                          >
                            <Icon name="trash" className="size-4" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  }
                />
                <CardBody className="flex flex-col gap-4">
                  <p className="font-mono text-small text-muted" dir="ltr">
                    {role.name}
                  </p>
                  {builtIn && isGlobalAdmin ? (
                    <p className="text-small text-muted">{text.builtInNote}</p>
                  ) : null}
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
            )
          })}
        </div>
      )}

      {isGlobalAdmin && editing !== false && roles.data ? (
        <RoleDrawer
          key={editing?.id ?? 'new'}
          role={editing}
          existing={roles.data}
          onClose={() => setEditing(false)}
        />
      ) : null}

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleteRole.isPending}
        destructive
        title={text.deleteTitle}
        consequence={removing ? text.deleteConsequence(removing.name) : ''}
        confirmLabel={text.delete}
        cancelLabel={shell.common.cancel}
      />
    </div>
  )
}
