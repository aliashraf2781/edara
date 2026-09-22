import { NavLink } from 'react-router'
import { useDict } from '~/lib/i18n/use-dict'
import { cn } from '~/ui/cn'
import { resultsText } from './results.i18n'

/**
 * The school's three screens are routes, not local state, so this mirrors the
 * <Tabs> treatment over <NavLink> rather than reusing the controlled widget.
 */
export function SchoolNav({ code, label }: { code: string; label: string }) {
  const text = useDict(resultsText)

  const items = [
    { to: `/admin/schools/${code}`, label: text.tabs.overview, end: true },
    { to: `/admin/schools/${code}/results`, label: text.tabs.results, end: false },
    { to: `/admin/schools/${code}/students`, label: text.tabs.students, end: false },
  ]

  return (
    <nav aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex h-11 shrink-0 items-center border-b-2 px-4 text-body whitespace-nowrap',
              'transition-colors duration-150 ease-out',
              isActive
                ? 'border-accent font-semibold text-ink'
                : 'border-transparent text-muted hover:text-ink',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
