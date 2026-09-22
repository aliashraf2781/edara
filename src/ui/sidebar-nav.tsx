import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { cn } from './cn'
import { Icon, type IconName } from './icon'

/**
 * The sidebar is a fixed dark panel independent of the light/dark toggle
 * (see theme.css), so every piece here reads from --color-sidebar-* rather
 * than the page's semantic tokens.
 */

/** A titled cluster of links. Renders nothing extra when the group is empty. */
export function SidebarNavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="label-micro px-3 pb-1.5 text-sidebar-muted">{label}</p>
      {children}
    </div>
  )
}

/** Pins the account group to the bottom of the sidebar's own scroll area. */
export function SidebarNavFooter({ children }: { children: ReactNode }) {
  return <div className="mt-auto flex flex-col gap-0.5 border-t border-sidebar-line pt-3">{children}</div>
}

type SidebarNavLinkProps = {
  to: string
  icon: IconName
  label: ReactNode
  badge?: ReactNode
}

/** The icon rides in its own tile, which fills solid on the active item and
 * pops bright on hover — the tile alone carries the selected state, so the
 * label never needs its own color and stays perfectly legible on the dark panel. */
export function SidebarNavLink({ to, icon, label, badge }: SidebarNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex min-h-11 items-center gap-3 rounded-control px-2 py-1.5 text-body',
          'transition-colors duration-150 ease-out',
          isActive
            ? 'bg-sidebar-active font-semibold text-sidebar-ink'
            : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-[7px]',
              'transition-colors duration-150 ease-out',
              isActive
                ? 'bg-sidebar-accent text-white shadow-xs'
                : 'bg-white/5 text-sidebar-muted group-hover:bg-white group-hover:text-sidebar',
            )}
          >
            <Icon name={icon} className="size-4.5" />
          </span>
          <span className="flex-1 truncate">{label}</span>
          {badge}
        </>
      )}
    </NavLink>
  )
}
