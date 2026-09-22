import { cn } from './cn'

/** The one status treatment in the product: a tinted pill with a leading dot. */
export type StampTone = 'neutral' | 'info' | 'attention' | 'success' | 'danger' | 'sealed'

const TONES: Record<StampTone, string> = {
  neutral: 'bg-muted/12 text-muted',
  info: 'bg-info/12 text-info',
  attention: 'bg-attention/12 text-attention',
  success: 'bg-success/12 text-success',
  danger: 'bg-danger/12 text-danger',
  // Terminal states read as a solid fill rather than a tint.
  sealed: 'bg-success text-paper',
}

const DOTS: Record<StampTone, string> = {
  neutral: 'bg-muted',
  info: 'bg-info',
  attention: 'bg-attention',
  success: 'bg-success',
  danger: 'bg-danger',
  sealed: 'bg-paper',
}

type StampProps = {
  tone: StampTone
  children: string
  className?: string
}

export function Stamp({ tone, children, className }: StampProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1.5 rounded-pill px-2.5 py-1',
        'text-micro font-semibold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', DOTS[tone])} aria-hidden="true" />
      {children}
    </span>
  )
}
