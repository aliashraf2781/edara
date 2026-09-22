import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { Select } from '~/ui/select'
import { schoolText } from '../school.i18n'
import { GRADE_OPTIONS, TERM_OPTIONS } from './curriculum-options'

type PickerProps = {
  value: string
  onChange: (value: string) => void
  /** Omitted for a picker that always holds a value. */
  placeholder?: string
  label?: string
  required?: boolean
  error?: string
  className?: string
}

export function TermField({ value, onChange, placeholder, label, required, error, className }: PickerProps) {
  const text = useDict(schoolText)
  return (
    <Field label={label ?? text.pickers.term} required={required} error={error} className={className}>
      {(props) => (
        <Select
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={TERM_OPTIONS}
          placeholder={placeholder}
        />
      )}
    </Field>
  )
}

export function GradeField({ value, onChange, placeholder, label, required, error, className }: PickerProps) {
  const text = useDict(schoolText)
  return (
    <Field label={label ?? text.pickers.grade} required={required} error={error} className={className}>
      {(props) => (
        <Select
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={GRADE_OPTIONS}
          placeholder={placeholder}
        />
      )}
    </Field>
  )
}
