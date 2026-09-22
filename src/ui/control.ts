import { cn } from './cn'

/**
 * Shared resting look for every text-like control: a crisp hairline with a
 * soft inner shadow at rest, and a solid-border + halo ring on focus — the
 * pairing reads as deliberate and precise rather than a plain browser input.
 */
export const controlClass = (invalid?: boolean, className?: string) =>
  cn(
    'h-11 w-full rounded-input border bg-surface px-4 text-body text-ink shadow-xs',
    'outline-none transition-[border-color,box-shadow] duration-200 ease-out-soft',
    'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-muted disabled:shadow-none',
    invalid
      ? 'border-danger focus:border-danger focus:shadow-ring-danger'
      : 'border-line-strong hover:border-muted focus:border-accent focus:shadow-ring',
    className,
  )
