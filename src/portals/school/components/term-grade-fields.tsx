import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { Select } from '~/ui/select'
import { useAllExamPeriodOptions, useGradeOptions } from '../api/use-options'
import { schoolText } from '../school.i18n'

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
  const options = useAllExamPeriodOptions()

  return (
    <Field label={label ?? text.pickers.term} required={required} error={error} className={className}>
      {(props) => (
        <Select
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={options}
          // Without a placeholder, a controlled empty value has nothing to
          // match: the browser just shows the first real option (often the
          // only one there is) with nothing actually selected, so the
          // operator sees a term "already picked" that onChange never
          // fired for. Always give the native <select> a real empty slot.
          placeholder={placeholder ?? text.pickers.pickTerm}
        />
      )}
    </Field>
  )
}

export function GradeField({ value, onChange, placeholder, label, required, error, className }: PickerProps) {
  const text = useDict(schoolText)
  const options = useGradeOptions()

  return (
    <Field label={label ?? text.pickers.grade} required={required} error={error} className={className}>
      {(props) => (
        <Select
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={options}
          placeholder={placeholder ?? text.pickers.pickGrade}
        />
      )}
    </Field>
  )
}
