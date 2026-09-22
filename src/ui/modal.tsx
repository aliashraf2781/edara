import type { ReactNode } from 'react'
import { Button } from './button'
import { Icon } from './icon'
import { useModalElement } from './use-modal-element'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  closeLabel: string
  children: ReactNode
}

/**
 * Centered and wide, unlike Drawer (which pins to the trailing edge for
 * a form the user fills in while still seeing the table underneath) —
 * for content meant to be read and compared, like a subject table that
 * runs wider than a drawer's column.
 */
export function Modal({ open, onClose, title, description, closeLabel, children }: ModalProps) {
  const { ref, onBackdropClick } = useModalElement(open, onClose)

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-label={title}
      className="m-auto w-full max-w-3xl rounded-large border border-line bg-surface p-0 text-ink shadow-drawer backdrop:bg-ink-strong/50"
    >
      <div className="flex max-h-[85vh] flex-col">
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
      </div>
    </dialog>
  )
}
