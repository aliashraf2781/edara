import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { cn } from './cn'
import { Icon } from './icon'

type AppShellProps = {
  /** The portal's nav component (e.g. <AdminSidebar />). */
  sidebar: ReactNode
  navLabel: string
  closeLabel: string
  /** Receives the toggle so the header can render a menu button below `md`. */
  header: (onMenuClick: () => void) => ReactNode
  children: ReactNode
}

/**
 * The sidebar runs the full viewport height, independent of the header — the
 * header sits only above the content column, not above the nav. Below `md`
 * the sidebar becomes an off-canvas drawer opened from the header's menu button.
 */
export function AppShell({ sidebar, navLabel, closeLabel, header, children }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // A link inside the drawer navigates without ever closing it otherwise.
  // Adjusted during render (not an effect) so the drawer never flashes open
  // on the new route before closing — see "you might not need an effect".
  const [renderedPathname, setRenderedPathname] = useState(pathname)
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <div className="flex min-h-dvh bg-paper">
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-ink-strong/50 transition-opacity duration-200 md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label={navLabel}
        className={cn(
          // Slides via `inset-inline-start` (the `start-*`/`inset-s-*` logical
          // property), not `translate-x` — it flips for RTL on its own, where
          // a physical transform would need a Tailwind `rtl:` variant this
          // project doesn't have configured, and silently do nothing.
          'fixed inset-y-0 inset-s-0 z-50 w-72 bg-sidebar transition-[inset-inline-start] duration-200 ease-out',
          'md:sticky md:top-0 md:z-auto md:h-dvh md:w-64 md:shrink-0 md:self-start',
          // Scoped to below `md` so nothing here can ever fight the desktop
          // layout — at `md` and up the sidebar is simply always in place.
          !open && 'max-md:-inset-s-72',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={closeLabel}
          className={cn(
            'absolute inset-e-2 top-2 flex size-9 items-center justify-center rounded-control',
            'text-sidebar-muted transition-colors duration-150 ease-out hover:bg-sidebar-hover hover:text-sidebar-ink md:hidden',
          )}
        >
          <Icon name="close" />
        </button>
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {header(() => setOpen(true))}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
          <div className="mx-auto w-full max-w-shell">{children}</div>
        </main>
      </div>
    </div>
  )
}
