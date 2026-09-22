import { NavLink } from 'react-router'
import type { Dict } from '~/lib/i18n/locales'
import { useDict } from '~/lib/i18n/use-dict'
import { cn } from './cn'

const text: Dict<{ label: string; school: string; admin: string }> = {
  ar: { label: 'اختيار البوابة', school: 'بوابة المدرسة', admin: 'إدارة المنصة' },
  en: { label: 'Choose a portal', school: 'School portal', admin: 'Platform admin' },
}

/**
 * Shared across both login screens so the two portals never describe each
 * other in slightly different words — this is the one place that owns both.
 */
export function PortalSwitcher() {
  const t = useDict(text)
  const options = [
    { to: '/school/login', label: t.school },
    { to: '/admin/login', label: t.admin },
  ] as const

  return (
    <div
      role="tablist"
      aria-label={t.label}
      className="inline-flex self-center rounded-pill border border-line bg-sunken p-1"
    >
      {options.map((option) => (
        <NavLink
          key={option.to}
          to={option.to}
          end
          role="tab"
          className={({ isActive }) =>
            cn(
              'rounded-pill px-4 py-2 text-small font-medium whitespace-nowrap',
              'transition-colors duration-150 ease-out',
              isActive ? 'bg-surface text-ink shadow-xs' : 'text-muted hover:text-ink',
            )
          }
        >
          {option.label}
        </NavLink>
      ))}
    </div>
  )
}
