import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { ErrorState } from '~/ui/error-state'
import { FullPageLoader } from '~/ui/full-page-loader'
import { adminText } from '../admin.i18n'
import { AdminSessionProvider } from '../auth/session-context'
import { useAdminIdentity, useAdminToken } from '../auth/use-admin-session'

/**
 * A 401 anywhere clears the token store, which re-renders this guard and lands
 * the user back on the admin login — no per-screen redirect handling needed.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const text = useDict(adminText)
  const location = useLocation()
  const token = useAdminToken()
  const identity = useAdminIdentity(token !== null)

  if (token === null) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (identity.isPending) return <FullPageLoader label={text.guard.loading} />

  if (identity.isError) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <ErrorState error={identity.error} onRetry={() => void identity.refetch()} labels={text.error} />
      </div>
    )
  }

  return <AdminSessionProvider identity={identity.data}>{children}</AdminSessionProvider>
}
