import type { InputHTMLAttributes } from 'react'
import { controlClass } from './control'

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      className={controlClass(rest['aria-invalid'] === true, className)}
    />
  )
}

/** Codes, national IDs and scores read as a ledger column, so they set in mono. */
export function NumeralInput({ className, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      dir="ltr"
      className={controlClass(rest['aria-invalid'] === true, `font-mono text-start ${className ?? ''}`)}
    />
  )
}
