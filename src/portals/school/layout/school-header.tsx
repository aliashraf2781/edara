import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Icon } from '~/ui/icon'
import { LocaleToggle, ThemeToggle } from '~/ui/preference-controls'
import { Stamp } from '~/ui/stamp'
import { useSchoolSession } from '../auth/session-context'
import { useSchoolLogout } from '../auth/use-school-session'
import { schoolText } from '../school.i18n'
import type { SchoolRole } from '../api/roles'

export function SchoolHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const text = useDict(schoolText)
  const { user, school } = useSchoolSession()
  const logout = useSchoolLogout()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-4 py-3 shadow-xs sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="-ms-2 md:hidden" onClick={onMenuClick} aria-label={text.header.menu}>
          <Icon name="menu" />
        </Button>
        {/* The school's own name, so nobody mistakes whose data they are reading. */}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent/10 text-accent">
          <Icon name="school" />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-h2 font-semibold text-ink">{school.name}</p>
          <p className="font-mono text-small text-muted" dir="ltr">
            {school.code}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden items-center gap-2 border-e border-line pe-3 sm:flex">
          <span className="text-body text-ink">{user.name}</span>
          {user.roles.map((role) => (
            <Stamp key={role} tone="neutral">
              {text.roles[role as SchoolRole] ?? role}
            </Stamp>
          ))}
        </div>

        <LocaleToggle label={text.header.language} />
        <ThemeToggle label={text.header.theme} />

        <Button variant="ghost" loading={logout.isPending} onClick={() => logout.mutate()}>
          <Icon name="logout" directional />
          <span className="hidden text-small sm:inline">{text.header.signOut}</span>
        </Button>
      </div>
    </header>
  )
}
