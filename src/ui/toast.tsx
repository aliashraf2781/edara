import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { isApiError } from '~/lib/api/error'
import { cn } from './cn'
import { Icon, type IconName } from './icon'

const DISMISS_MS = 4000

export type ToastTone = 'success' | 'danger' | 'info'

type Toast = { id: number; tone: ToastTone; message: string }

type ToastContextValue = {
  notify: (tone: ToastTone, message: string) => void
  /** Turns any thrown value into one line, with the 429 wait spelled out. */
  notifyError: (error: unknown, fallback: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_ICON: Record<ToastTone, IconName> = {
  success: 'check',
  danger: 'alert',
  info: 'info',
}

const TONE_CLASS: Record<ToastTone, string> = {
  success: 'border-s-success text-success',
  danger: 'border-s-danger text-danger',
  info: 'border-s-accent text-accent',
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([])

  const notify = useCallback((tone: ToastTone, message: string) => {
    const id = nextId++
    setToasts((current) => [...current, { id, tone, message }])
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), DISMISS_MS)
  }, [])

  const notifyError = useCallback(
    (error: unknown, fallback: string) => {
      // The server's own message is already localised by Accept-Language, and
      // on a 429 it already names the wait in seconds — so it is shown as-is
      // rather than rebuilt here, which would hardcode one language.
      notify('danger', isApiError(error) ? error.message : fallback)
    },
    [notify],
  )

  const value = useMemo(() => ({ notify, notifyError }), [notify, notifyError])

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-6 start-6 z-50 flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className={cn(
              'animate-toast-in flex items-center gap-3 rounded-card border border-line border-s-2 bg-surface px-4 py-3',
              'text-body text-ink shadow-toast',
              TONE_CLASS[toast.tone],
            )}
          >
            <Icon name={TONE_ICON[toast.tone]} className="size-4" />
            <span className="text-ink">{toast.message}</span>
          </p>
        ))}
      </div>
    </ToastContext>
  )
}

export function useToast(): ToastContextValue {
  const value = use(ToastContext)
  if (!value) throw new Error('useToast must be used inside <ToastProvider>')
  return value
}
