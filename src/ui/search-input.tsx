import type { InputHTMLAttributes } from 'react'
import { cn } from './cn'
import { Icon } from './icon'

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

/** Search stays in the toolbar above the table, never in a panel that hides it. */
export function SearchInput({ label, className, ...rest }: SearchInputProps) {
  return (
    <div className={cn('relative flex min-w-64 items-center', className)}>
      <Icon name="search" className="pointer-events-none absolute inset-s-4 size-4 text-muted" />
      <input
        {...rest}
        type="search"
        aria-label={label}
        placeholder={rest.placeholder ?? label}
        className={cn(
          'h-11 w-full rounded-input border border-line-strong bg-surface ps-11 pe-4 text-body text-ink shadow-xs',
          'outline-none transition-[border-color,box-shadow] duration-200 ease-out-soft',
          'hover:border-muted focus:border-accent focus:shadow-ring',
        )}
      />
    </div>
  )
}
