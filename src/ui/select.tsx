import type { SelectHTMLAttributes } from 'react'
import { cn } from './cn'
import { controlClass } from './control'
import { Icon } from './icon'

export type SelectOption = { value: string; label: string }

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly SelectOption[]
  /** Shown as a disabled first row when the field is optional or unset. */
  placeholder?: string
}

export function Select({ options, placeholder, className, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={controlClass(rest['aria-invalid'] === true, cn('appearance-none pe-9', className))}
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevronDown"
        className={cn(
          'pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted',
          rest.disabled && 'opacity-50',
        )}
      />
    </div>
  )
}
