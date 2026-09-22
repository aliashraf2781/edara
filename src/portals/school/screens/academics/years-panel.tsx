import { z } from 'zod'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Checkbox } from '~/ui/checkbox'
import { Field } from '~/ui/field'
import { Stamp } from '~/ui/stamp'
import { TextInput } from '~/ui/text-input'
import type { AcademicYear } from '../../api/types'
import { academicsText } from './academics.i18n'
import { ResourcePanel } from './resource-panel'

const FIELDS = ['code', 'name', 'starts_on', 'ends_on', 'is_current'] as const

export function YearsPanel({ editable }: { editable: boolean }) {
  const text = useDict(academicsText)
  const v = useDict(validationText)

  const schema = z.object({
    code: z.string().trim().min(1, v.required),
    name: z.string().trim().min(1, v.required),
    starts_on: z.string().min(1, v.required),
    ends_on: z.string().min(1, v.required),
    is_current: z.boolean(),
  })

  return (
    <ResourcePanel<AcademicYear, z.infer<typeof schema>>
      resource="academic-years"
      title={text.tabs.years}
      editable={editable}
      empty={text.empty.years}
      schema={schema}
      fields={FIELDS}
      defaults={{ code: '', name: '', starts_on: '', ends_on: '', is_current: false }}
      rowKey={(row) => row.id}
      rowLabel={(row) => row.name}
      toForm={(row) => ({
        code: row.code,
        name: row.name,
        starts_on: row.starts_on,
        ends_on: row.ends_on,
        is_current: row.is_current,
      })}
      columns={[
        { key: 'code', header: text.fields.code, cell: (row) => <span className="font-mono">{row.code}</span> },
        {
          key: 'name',
          header: text.fields.name,
          cell: (row) => (
            <span className="flex items-center gap-2">
              {row.name}
              {row.is_current ? <Stamp tone="success">{text.current}</Stamp> : null}
            </span>
          ),
        },
        { key: 'starts', header: text.fields.startsOn, numeric: true, cell: (row) => row.starts_on },
        { key: 'ends', header: text.fields.endsOn, numeric: true, cell: (row) => row.ends_on },
      ]}
      renderFields={(form) => (
        <>
          <Field label={text.fields.code} error={form.formState.errors.code?.message} required>
            {(props) => <TextInput {...props} {...form.register('code')} dir="ltr" className="font-mono" />}
          </Field>
          <Field label={text.fields.name} error={form.formState.errors.name?.message} required>
            {(props) => <TextInput {...props} {...form.register('name')} />}
          </Field>
          <Field label={text.fields.startsOn} error={form.formState.errors.starts_on?.message} required>
            {(props) => <TextInput {...props} {...form.register('starts_on')} type="date" dir="ltr" />}
          </Field>
          <Field label={text.fields.endsOn} error={form.formState.errors.ends_on?.message} required>
            {(props) => <TextInput {...props} {...form.register('ends_on')} type="date" dir="ltr" />}
          </Field>
          <Checkbox label={text.fields.isCurrent} {...form.register('is_current')} />
        </>
      )}
    />
  )
}
