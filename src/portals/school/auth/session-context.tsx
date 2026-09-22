import { createContext, use, useMemo, type ReactNode } from 'react'
import { capabilitiesFor, type SchoolCapabilities } from '../api/roles'
import type { SchoolIdentity } from '../api/types'

type SessionValue = SchoolIdentity & { can: SchoolCapabilities }

const SessionContext = createContext<SessionValue | null>(null)

/**
 * The session is scoped to exactly one school for its whole lifetime. There is
 * no school id on any request and no way to change schools without signing out.
 */
export function SchoolSessionProvider({
  identity,
  children,
}: {
  identity: SchoolIdentity
  children: ReactNode
}) {
  const value = useMemo<SessionValue>(
    () => ({ ...identity, can: capabilitiesFor(identity.user.roles) }),
    [identity],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSchoolSession(): SessionValue {
  const value = use(SessionContext)
  if (!value) throw new Error('useSchoolSession must be used inside <SchoolSessionProvider>')
  return value
}
