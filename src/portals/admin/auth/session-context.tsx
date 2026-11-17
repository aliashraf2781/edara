import { createContext, use, useMemo, type ReactNode } from 'react'
import { GLOBAL_ADMIN_ROLE, SUPER_ADMIN_ROLE } from '../api/permissions'
import type { AdminIdentity } from '../api/types'

type SessionValue = AdminIdentity & {
  can: (permission: string) => boolean
  /** global-admin or super-admin: the only roles allowed to write roles. */
  isGlobalAdmin: boolean
  isSuperAdmin: boolean
}

const SessionContext = createContext<SessionValue | null>(null)

export function AdminSessionProvider({
  identity,
  children,
}: {
  identity: AdminIdentity
  children: ReactNode
}) {
  const value = useMemo<SessionValue>(() => {
    const granted = new Set(identity.permissions)
    const roles = identity.user.roles
    const isSuperAdmin = roles.includes(SUPER_ADMIN_ROLE)
    return {
      ...identity,
      // The backend lets super-admin bypass every check, and /admin/me may not
      // list all permissions for it — so it is "can do everything" here.
      // Set lookup: gating runs on every sidebar item and row action.
      can: (permission) => isSuperAdmin || granted.has(permission),
      isSuperAdmin,
      isGlobalAdmin: isSuperAdmin || roles.includes(GLOBAL_ADMIN_ROLE),
    }
  }, [identity])

  return <SessionContext value={value}>{children}</SessionContext>
}

/** Only reachable behind the auth guard, so the identity is never null here. */
export function useAdminSession(): SessionValue {
  const value = use(SessionContext)
  if (!value) throw new Error('useAdminSession must be used inside <AdminSessionProvider>')
  return value
}
