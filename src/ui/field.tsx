import { useId, type ReactNode } from 'react'
import { cn } from './cn'

type FieldProps = {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  /** Receives the wiring every control needs to stay announced correctly. */
  children: (props: {
    id: string
    'aria-invalid': boolean | undefined
    'aria-describedby': string | undefined
  }) => ReactNode
}

export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <label htmlFor={id} className="label-form">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}

      {error ? (
        <p id={errorId} role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-small text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
