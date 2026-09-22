import { z } from 'zod'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { NumeralInput, TextInput } from '~/ui/text-input'
import type { EducationalStage } from '../../api/types'
import { academicsText } from './academics.i18n'
import { ResourcePanel } from './resource-panel'

const FIELDS = ['code', 'name', 'sort_order'] as const

export function StagesPanel({ editable }: { editable: boolean }) {
  const text = useDict(academicsText)
  const v = useDict(validationText)

  const schema = z.object({
    code: z.string().trim().min(1, v.required),
    name: z.string().trim().min(1, v.required),
    sort_order: z.coerce.number().int().min(0, v.notNegative),
  })

  return (
    <ResourcePanel<EducationalStage, z.infer<typeof schema>>
      resource="educational-stages"
      title={text.tabs.stages}
      editable={editable}
      empty={text.empty.stages}
      schema={schema}
      fields={FIELDS}
      defaults={{ code: '', name: '', sort_order: 0 }}
      rowKey={(row) => row.id}
      rowLabel={(row) => row.name}
      toForm={(row) => ({
        code: row.code,
        name: row.name,
        sort_order: row.sort_order ?? 0,
      })}
      columns={[
        { key: 'code', header: text.fields.code, cell: (row) => <span className="font-mono">{row.code}</span> },
        { key: 'name', header: text.fields.name, cell: (row) => row.name },
        {
          key: 'order',
          header: text.fields.sortOrder,
          numeric: true,
          cell: (row) => row.sort_order ?? '—',
        },
      ]}
      renderFields={(form) => (
        <>
          <Field label={text.fields.code} error={form.formState.errors.code?.message} required>
            {(props) => <TextInput {...props} {...form.register('code')} dir="ltr" className="font-mono" />}
          </Field>
          <Field label={text.fields.name} error={form.formState.errors.name?.message} required>
            {(props) => <TextInput {...props} {...form.register('name')} />}
          </Field>
          <Field label={text.fields.sortOrder} error={form.formState.errors.sort_order?.message}>
            {(props) => <NumeralInput {...props} {...form.register('sort_order')} type="number" min={0} />}
          </Field>
        </>
      )}
    />
  )
}
