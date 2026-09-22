import { useDict } from '~/lib/i18n/use-dict'
import { SidebarNavFooter, SidebarNavGroup, SidebarNavLink } from '~/ui/sidebar-nav'
import type { IconName } from '~/ui/icon'
import { adminText } from '../admin.i18n'
import { PERMISSION } from '../api/permissions'
import { useAdminSession } from '../auth/session-context'

type NavItem = {
  to: string
  label: string
  icon: IconName
  permission: string | null
  pending?: boolean
}

export function AdminSidebar() {
  const text = useDict(adminText)
  const { can } = useAdminSession()

  const overview: NavItem[] = [
    { to: '/admin/schools', label: text.nav.schools, icon: 'school', permission: PERMISSION.viewTenants },
  ]
  const results: NavItem[] = [
    { to: '/admin/insights', label: text.nav.insights, icon: 'chart', permission: PERMISSION.viewTenants },
  ]
  const access: NavItem[] = [
    { to: '/admin/users', label: text.nav.users, icon: 'users', permission: PERMISSION.viewGlobalUsers },
    { to: '/admin/roles', label: text.nav.roles, icon: 'shield', permission: PERMISSION.viewGlobalUsers },
    // The endpoint is not implemented yet, so the item says so instead of
    // leading to a screen that can only fail.
    { to: '/admin/audit-log', label: text.nav.audit, icon: 'clock', permission: PERMISSION.viewAuditLog, pending: true },
  ]
  const account: NavItem[] = [{ to: '/admin/profile', label: text.nav.profile, icon: 'user', permission: null }]

  const visible = (items: NavItem[]) => items.filter((item) => item.permission === null || can(item.permission))

  return (
    <nav aria-label={text.portal} className="flex h-full flex-col gap-5 p-3">
      <SidebarNavGroup label={text.nav.groups.overview}>
        {visible(overview).map((item) => (
          <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </SidebarNavGroup>

      <SidebarNavGroup label={text.nav.groups.results}>
        {visible(results).map((item) => (
          <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </SidebarNavGroup>

      <SidebarNavGroup label={text.nav.groups.access}>
        {visible(access).map((item) => (
          <SidebarNavLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            badge={
              item.pending ? (
                <span className="rounded-pill bg-white/10 px-2 py-0.5 text-micro font-semibold text-sidebar-muted">
                  {text.nav.comingSoon}
                </span>
              ) : undefined
            }
          />
        ))}
      </SidebarNavGroup>

      <SidebarNavFooter>
        {visible(account).map((item) => (
          <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </SidebarNavFooter>
    </nav>
  )
}
