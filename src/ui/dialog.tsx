import type { ReactNode } from 'react'
import { Button } from './button'
import { useModalElement } from './use-modal-element'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer: ReactNode
  /** Blocks Esc and backdrop dismissal while a synchronous call is running. */
  busy?: boolean
}

export function Dialog({ open, onClose, title, children, footer, busy = false }: DialogProps) {
  const { ref, onBackdropClick } = useModalElement(open, onClose)

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={busy ? undefined : onClose}
      onCancel={busy ? (event) => event.preventDefault() : undefined}
      onClick={busy ? undefined : onBackdropClick}
      className="m-auto w-full max-w-md rounded-large border border-line bg-surface p-0 text-ink shadow-drawer backdrop:bg-ink-strong/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-h1 font-semibold">{title}</h2>
        <div className="flex flex-col gap-3 text-body text-muted">{children}</div>
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">{footer}</div>
      </div>
    </dialog>
  )
}

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  /** Restates the consequence in plain language, not "are you sure?". */
  consequence: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  consequence,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      busy={loading}
      footer={
        <>
          <Button onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" destructive={destructive} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{consequence}</p>
    </Dialog>
  )
}
