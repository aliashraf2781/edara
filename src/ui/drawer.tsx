import type { ReactNode } from 'react'
import { useLocale } from '~/lib/i18n/locale-context'
import { Button } from './button'
import { Icon } from './icon'
import { useModalElement } from './use-modal-element'

type DrawerProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  closeLabel: string
  /** Pinned to the bottom, outside the scrolling body. */
  footer?: ReactNode
  children: ReactNode
}

/**
 * Slides in from the trailing edge and leaves the table visible underneath —
 * a full-screen modal would throw away the context the user was reading.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  closeLabel,
  footer,
  children,
}: DrawerProps) {
  const { direction } = useLocale()
  const { ref, onBackdropClick } = useModalElement(open, onClose)

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-label={title}
      className={`m-0 ms-auto h-dvh max-h-dvh w-full max-w-lg rounded-large border border-line bg-surface p-0 text-ink shadow-drawer backdrop:bg-ink-strong/50 ${
        direction === 'rtl' ? 'animate-drawer-in-rtl' : 'animate-drawer-in'
      }`}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-h1 font-semibold">{title}</h2>
            {description ? <p className="text-small text-muted">{description}</p> : null}
          </div>
          <Button variant="ghost" onClick={onClose} aria-label={closeLabel}>
            <Icon name="close" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  )
}
