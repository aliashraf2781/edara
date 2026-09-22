import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './icon'

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode
  description?: string
}

/**
 * A drawn box rather than the native control — browsers render checkboxes
 * inconsistently, and a system of record can't afford that on a legal form.
 */
export function Checkbox({ label, description, className, ...rest }: CheckboxProps) {
  return (
    <label
      className={cn(
        'group flex min-h-10 cursor-pointer items-start gap-3 py-1',
        rest.disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative mt-0.5 flex shrink-0">
        <input {...rest} type="checkbox" className="sr-only" />
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-[5px] border border-line-strong bg-surface shadow-xs',
            'transition-colors duration-150 ease-out',
            'group-has-checked:border-accent group-has-checked:bg-accent',
            'group-has-focus-visible:border-accent group-has-focus-visible:shadow-ring',
          )}
        >
          <Icon name="check" className="size-3.5 text-paper opacity-0 group-has-checked:opacity-100" />
        </span>
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-body text-ink">{label}</span>
        {description ? <span className="text-small text-muted">{description}</span> : null}
      </span>
    </label>
  )
}
