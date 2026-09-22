import { useState } from 'react'
import { useDict } from '~/lib/i18n/use-dict'
import { Button } from '~/ui/button'
import { Field } from '~/ui/field'
import { Icon } from '~/ui/icon'
import { Select } from '~/ui/select'
import { TextInput } from '~/ui/text-input'
import { useToast } from '~/ui/toast'
import { useSaveExamPeriod } from '../api/exam-periods'
import { useExamPeriodOptions } from '../api/use-options'
import { useSchoolSession } from '../auth/session-context'
import { schoolText } from '../school.i18n'

type ExamPeriodFieldProps = {
  academicYearId: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

/**
 * Scoped to whichever academic year the caller has already picked. When that
 * year has no exam period yet, an inline quick-add form replaces the picker
 * instead of blocking the operator on a trip to the exam periods screen.
 */
export function ExamPeriodField({ academicYearId, value, onChange, error, required }: ExamPeriodFieldProps) {
  const text = useDict(schoolText)
  const { can } = useSchoolSession()
  const { notify, notifyError } = useToast()
  const options = useExamPeriodOptions(academicYearId)
  const save = useSaveExamPeriod()

  const [creating, setCreating] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [term, setTerm] = useState('')

  if (academicYearId === '') {
    return (
      <Field label={text.examPeriodField.label} required={required}>
        {() => <p className="text-small text-muted">{text.examPeriodField.pickYearFirst}</p>}
      </Field>
    )
  }

  if (options.length === 0) {
    if (!can.canEditStructure) {
      return (
        <Field label={text.examPeriodField.label} required={required}>
          {() => <p className="text-small text-muted">{text.examPeriodField.empty}</p>}
        </Field>
      )
    }

    const submit = async () => {
      if (code.trim() === '' || name.trim() === '') return notify('danger', text.examPeriodField.quickCreateNeeded)
      try {
        const created = await save.mutateAsync({
          id: null,
          values: {
            academic_year_id: academicYearId,
            code: code.trim(),
            name: name.trim(),
            term: term.trim() === '' ? undefined : Number(term),
          },
        })
        notify('success', text.examPeriodField.created)
        onChange(String(created.id))
        setCreating(false)
        setCode('')
        setName('')
        setTerm('')
      } catch (creationError) {
        notifyError(creationError, text.examPeriodField.quickCreateNeeded)
      }
    }

    return (
      <div className="flex flex-col gap-3 rounded-control border border-attention border-s-2 bg-attention/8 p-4">
        <p className="flex items-start gap-2 text-small text-attention">
          <Icon name="info" className="size-4 shrink-0" />
          <span>{text.examPeriodField.empty}</span>
        </p>

        {creating ? (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={text.examPeriodField.code} required>
                {(props) => (
                  <TextInput {...props} value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" />
                )}
              </Field>
              <Field label={text.examPeriodField.name} required>
                {(props) => <TextInput {...props} value={name} onChange={(e) => setName(e.target.value)} />}
              </Field>
              <Field label={text.examPeriodField.term}>
                {(props) => (
                  <TextInput {...props} value={term} onChange={(e) => setTerm(e.target.value)} type="number" dir="ltr" />
                )}
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setCreating(false)} disabled={save.isPending}>
                {text.common.cancel}
              </Button>
              <Button variant="primary" onClick={submit} loading={save.isPending}>
                {text.examPeriodField.create}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-start">
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Icon name="plus" />
              {text.examPeriodField.create}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Field label={text.examPeriodField.label} error={error} required={required}>
      {(props) => (
        <Select
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={options}
          placeholder={text.examPeriodField.placeholder}
        />
      )}
    </Field>
  )
}
