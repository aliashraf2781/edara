import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { ErrorState } from '~/ui/error-state'
import { FullPageLoader } from '~/ui/full-page-loader'
import { schoolText } from '../school.i18n'
import { SchoolSessionProvider } from '../auth/session-context'
import { useSchoolIdentity, useSchoolToken } from '../auth/use-school-session'

export function RequireSchool({ children }: { children: ReactNode }) {
  const text = useDict(schoolText)
  const location = useLocation()
  const token = useSchoolToken()
  const identity = useSchoolIdentity(token !== null)

  if (token === null) {
    return <Navigate to="/school/login" replace state={{ from: location.pathname }} />
  }

  if (identity.isPending) return <FullPageLoader label={text.guard.loading} />

  if (identity.isError) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <ErrorState error={identity.error} onRetry={() => void identity.refetch()} labels={text.error} />
      </div>
    )
  }

  return <SchoolSessionProvider identity={identity.data}>{children}</SchoolSessionProvider>
}
