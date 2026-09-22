import { cn } from './cn'

/** Used only where the UI genuinely blocks, e.g. synchronous provisioning. */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      aria-live="polite"
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  )
}

/** Progress for uploads: a thin bar, never a circular gauge. */
export function ProgressBar({ label }: { label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      className="h-1 w-full overflow-hidden rounded-control bg-sunken"
    >
      <div className="h-full w-2/5 animate-progress bg-accent" />
    </div>
  )
}
