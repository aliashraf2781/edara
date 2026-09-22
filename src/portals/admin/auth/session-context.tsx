import { createContext, use, useMemo, type ReactNode } from 'react'
import { GLOBAL_ADMIN_ROLE } from '../api/permissions'
import type { AdminIdentity } from '../api/types'

type SessionValue = AdminIdentity & {
  can: (permission: string) => boolean
  isGlobalAdmin: boolean
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
    return {
      ...identity,
      // Set lookup: gating runs on every sidebar item and row action.
      can: (permission) => granted.has(permission),
      isGlobalAdmin: identity.user.roles.includes(GLOBAL_ADMIN_ROLE),
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
