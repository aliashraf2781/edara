import { Outlet } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { AppShell } from '~/ui/app-shell'
import { schoolText } from '../school.i18n'
import { RequireSchool } from './require-school'
import { SchoolHeader } from './school-header'
import { SchoolSidebar } from './school-sidebar'

export function SchoolShell() {
  const text = useDict(schoolText)

  return (
    <RequireSchool>
      <AppShell
        navLabel={text.portal}
        closeLabel={text.common.close}
        sidebar={<SchoolSidebar />}
        header={(onMenuClick) => <SchoolHeader onMenuClick={onMenuClick} />}
      >
        <Outlet />
      </AppShell>
    </RequireSchool>
  )
}
