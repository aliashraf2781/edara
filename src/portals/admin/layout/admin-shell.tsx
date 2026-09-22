import { Outlet } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { AppShell } from '~/ui/app-shell'
import { adminText } from '../admin.i18n'
import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'
import { RequireAdmin } from './require-admin'

export function AdminShell() {
  const text = useDict(adminText)

  return (
    <RequireAdmin>
      <AppShell
        navLabel={text.portal}
        closeLabel={text.common.close}
        sidebar={<AdminSidebar />}
        header={(onMenuClick) => <AdminHeader onMenuClick={onMenuClick} />}
      >
        <Outlet />
      </AppShell>
    </RequireAdmin>
  )
}
