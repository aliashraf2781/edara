import type { TextareaHTMLAttributes } from 'react'
import { cn } from './cn'

export function Textarea({
  className,
  rows = 3,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      rows={rows}
      className={cn(
        'w-full rounded-input border bg-surface px-4 py-3 text-body text-ink shadow-xs',
        'outline-none transition-[border-color,box-shadow] duration-200 ease-out-soft',
        rest['aria-invalid'] === true
          ? 'border-danger focus:border-danger focus:shadow-ring-danger'
          : 'border-line-strong hover:border-muted focus:border-accent focus:shadow-ring',
        className,
      )}
    />
  )
}
