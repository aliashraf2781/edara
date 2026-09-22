import { useEffect, useRef, type MouseEvent } from 'react'

/**
 * Drives a native <dialog>. The platform gives us the focus trap, Esc handling
 * and inertness for free — reimplementing those in React is how modals become
 * inaccessible.
 */
export function useModalElement(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === ref.current) onClose()
  }

  return { ref, onBackdropClick }
}
