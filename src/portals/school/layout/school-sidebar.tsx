import { useDict } from '~/lib/i18n/use-dict'
import type { IconName } from '~/ui/icon'
import { SidebarNavFooter, SidebarNavGroup, SidebarNavLink } from '~/ui/sidebar-nav'
import { useSchoolSession } from '../auth/session-context'
import { schoolText } from '../school.i18n'

type NavItem = { to: string; label: string; icon: IconName }

export function SchoolSidebar() {
  const text = useDict(schoolText)
  const { can } = useSchoolSession()

  const overview: NavItem[] = [{ to: '/school/dashboard', label: text.nav.dashboard, icon: 'chart' }]
  // Temporary: the structure and exam-period entries are hidden while the
  // curriculum is fixed to grades 4–6 and the two terms.
  const academic: NavItem[] = [
    { to: '/school/students', label: text.nav.students, icon: 'users' },
    { to: '/school/results', label: text.nav.results, icon: 'sheet' },
  ]
  const data: NavItem[] = [
    { to: '/school/imports', label: text.nav.imports, icon: 'upload' },
    { to: '/school/reports', label: text.nav.reports, icon: 'chart' },
  ]
  // Hidden entirely rather than shown disabled, for the other three roles.
  const team: NavItem[] = can.canManageStaff
    ? [{ to: '/school/staff', label: text.nav.staff, icon: 'shield' }]
    : []
  const account: NavItem[] = [{ to: '/school/profile', label: text.nav.profile, icon: 'user' }]

  return (
    <nav aria-label={text.portal} className="flex h-full flex-col gap-5 p-3">
      <SidebarNavGroup label={text.nav.groups.overview}>
        {overview.map((item) => (
          <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </SidebarNavGroup>

      <SidebarNavGroup label={text.nav.groups.academic}>
        {academic.map((item) => (
          <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </SidebarNavGroup>

      <SidebarNavGroup label={text.nav.groups.data}>
        {data.map((item) => (
          <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </SidebarNavGroup>

      {team.length > 0 ? (
        <SidebarNavGroup label={text.nav.groups.team}>
          {team.map((item) => (
            <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
          ))}
        </SidebarNavGroup>
      ) : null}

      <SidebarNavFooter>
        {account.map((item) => (
          <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </SidebarNavFooter>
    </nav>
  )
}
