import { z } from 'zod'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { Select } from '~/ui/select'
import { NumeralInput, TextInput } from '~/ui/text-input'
import type { Grade } from '../../api/types'
import { useStageOptions } from '../../api/use-options'
import { academicsText } from './academics.i18n'
import { ResourcePanel } from './resource-panel'

const FIELDS = ['educational_stage_id', 'code', 'name', 'level'] as const

export function GradesPanel({ editable }: { editable: boolean }) {
  const text = useDict(academicsText)
  const v = useDict(validationText)
  const stages = useStageOptions()

  const schema = z.object({
    educational_stage_id: z.string().min(1, v.required),
    code: z.string().trim().min(1, v.required),
    name: z.string().trim().min(1, v.required),
    level: z.coerce.number().int().min(0, v.notNegative),
  })

  const stageName = (id: string) => stages.find((option) => option.value === id)?.label ?? id

  return (
    <ResourcePanel<Grade, z.infer<typeof schema>>
      resource="grades"
      title={text.tabs.grades}
      editable={editable}
      empty={text.empty.grades}
      schema={schema}
      fields={FIELDS}
      defaults={{ educational_stage_id: '', code: '', name: '', level: 1 }}
      rowKey={(row) => row.id}
      rowLabel={(row) => row.name}
      toForm={(row) => ({
        educational_stage_id: row.educational_stage_id,
        code: row.code,
        name: row.name,
        level: row.level ?? 1,
      })}
      columns={[
        { key: 'code', header: text.fields.code, cell: (row) => <span className="font-mono">{row.code}</span> },
        { key: 'name', header: text.fields.name, cell: (row) => row.name },
        {
          key: 'stage',
          header: text.fields.stage,
          cell: (row) => stageName(row.educational_stage_id),
        },
        { key: 'level', header: text.fields.level, numeric: true, cell: (row) => row.level ?? '—' },
      ]}
      renderFields={(form) => (
        <>
          <Field
            label={text.fields.stage}
            error={form.formState.errors.educational_stage_id?.message}
            required
          >
            {(props) => (
              <Select
                {...props}
                {...form.register('educational_stage_id')}
                options={stages}
                placeholder={text.pickStage}
              />
            )}
          </Field>
          <Field label={text.fields.code} error={form.formState.errors.code?.message} required>
            {(props) => <TextInput {...props} {...form.register('code')} dir="ltr" className="font-mono" />}
          </Field>
          <Field label={text.fields.name} error={form.formState.errors.name?.message} required>
            {(props) => <TextInput {...props} {...form.register('name')} />}
          </Field>
          <Field label={text.fields.level} error={form.formState.errors.level?.message}>
            {(props) => <NumeralInput {...props} {...form.register('level')} type="number" min={0} />}
          </Field>
        </>
      )}
    />
  )
}
