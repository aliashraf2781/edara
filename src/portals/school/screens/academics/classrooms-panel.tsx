import { z } from 'zod'
import { validationText } from '~/lib/forms/validation.i18n'
import { useDict } from '~/lib/i18n/use-dict'
import { Field } from '~/ui/field'
import { Select } from '~/ui/select'
import { NumeralInput, TextInput } from '~/ui/text-input'
import type { Classroom } from '../../api/types'
import { useGradeOptions, useYearOptions } from '../../api/use-options'
import { academicsText } from './academics.i18n'
import { ResourcePanel } from './resource-panel'

const FIELDS = ['grade_id', 'academic_year_id', 'code', 'name', 'capacity'] as const

export function ClassroomsPanel({ editable }: { editable: boolean }) {
  const text = useDict(academicsText)
  const v = useDict(validationText)
  const grades = useGradeOptions()
  const years = useYearOptions()

  const schema = z.object({
    grade_id: z.string().min(1, v.required),
    academic_year_id: z.string().min(1, v.required),
    code: z.string().trim().min(1, v.required),
    name: z.string().trim().min(1, v.required),
    capacity: z.coerce.number().int().min(0, v.notNegative),
  })

  const labelFor = (options: readonly { value: string; label: string }[], id: string) =>
    options.find((option) => option.value === id)?.label ?? id

  return (
    <ResourcePanel<Classroom, z.infer<typeof schema>>
      resource="classrooms"
      title={text.tabs.classrooms}
      editable={editable}
      empty={text.empty.classrooms}
      schema={schema}
      fields={FIELDS}
      defaults={{ grade_id: '', academic_year_id: '', code: '', name: '', capacity: 30 }}
      rowKey={(row) => row.id}
      rowLabel={(row) => row.name}
      toForm={(row) => ({
        grade_id: row.grade_id,
        academic_year_id: row.academic_year_id,
        code: row.code,
        name: row.name,
        capacity: row.capacity ?? 0,
      })}
      columns={[
        { key: 'code', header: text.fields.code, cell: (row) => <span className="font-mono">{row.code}</span> },
        { key: 'name', header: text.fields.name, cell: (row) => row.name },
        { key: 'grade', header: text.fields.grade, cell: (row) => labelFor(grades, row.grade_id) },
        {
          key: 'year',
          header: text.fields.academicYear,
          cell: (row) => labelFor(years, row.academic_year_id),
        },
        {
          key: 'capacity',
          header: text.fields.capacity,
          numeric: true,
          cell: (row) => row.capacity ?? '—',
        },
      ]}
      renderFields={(form) => (
        <>
          <Field label={text.fields.grade} error={form.formState.errors.grade_id?.message} required>
            {(props) => (
              <Select {...props} {...form.register('grade_id')} options={grades} placeholder={text.pickGrade} />
            )}
          </Field>
          <Field
            label={text.fields.academicYear}
            error={form.formState.errors.academic_year_id?.message}
            required
          >
            {(props) => (
              <Select
                {...props}
                {...form.register('academic_year_id')}
                options={years}
                placeholder={text.pickYear}
              />
            )}
          </Field>
          <Field label={text.fields.code} error={form.formState.errors.code?.message} required>
            {(props) => <TextInput {...props} {...form.register('code')} dir="ltr" className="font-mono" />}
          </Field>
          <Field label={text.fields.name} error={form.formState.errors.name?.message} required>
            {(props) => <TextInput {...props} {...form.register('name')} />}
          </Field>
          <Field label={text.fields.capacity} error={form.formState.errors.capacity?.message}>
            {(props) => <NumeralInput {...props} {...form.register('capacity')} type="number" min={0} />}
          </Field>
        </>
      )}
    />
  )
}
