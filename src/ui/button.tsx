import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Spinner } from './spinner'

/** Three variants, two sizes. Adding a variant per screen is how systems drift. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-paper shadow-button border border-ink hover:bg-ink-strong hover:border-ink-strong focus-visible:shadow-ring',
  secondary:
    'bg-surface text-ink shadow-xs border border-line-strong hover:bg-sunken hover:border-muted focus-visible:border-accent focus-visible:shadow-ring',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-sunken focus-visible:shadow-ring',
}

const SIZES: Record<ButtonSize, string> = {
  // Both clear the 40px minimum target, including for row actions.
  md: 'h-10 px-4 text-body',
  lg: 'h-12 px-6 text-h2',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Danger is a state, not a fourth variant: it recolours primary/secondary. */
  destructive?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  destructive = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      // Disabling on submit is the first defence against the 429 tier.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control font-medium outline-none',
        'transition-[background-color,border-color,box-shadow] duration-150 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        VARIANTS[variant],
        SIZES[size],
        destructive && variant === 'primary' && 'border-danger bg-danger hover:border-danger hover:bg-danger',
        destructive && variant !== 'primary' && 'text-danger',
        className,
      )}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}
